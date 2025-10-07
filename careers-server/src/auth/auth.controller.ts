import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from './auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Company } from '../company/company.schema';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private oauthClient: OAuth2Client;

  constructor(
    private readonly authService: AuthService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';

    this.oauthClient = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri,
    });

    this.logger.log(
      `AuthController initialized with GOOGLE_REDIRECT_URI env='${process.env.GOOGLE_REDIRECT_URI}'`,
    );
  }

  @Get('google')
  googleAuth(@Res() res: Response) {
    this.logger.log('Starting Google OAuth flow...');
    const url = this.oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent',
    });
    this.logger.log(`Redirecting to Google Auth URL: ${url}`);
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
  ) {
    try {
      if (!code) {
        throw new HttpException(
          'Missing authorization code',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { tokens } = await this.oauthClient.getToken(code);
      const idToken = tokens.id_token;
      if (!idToken) {
        throw new HttpException(
          'Missing id_token from Google',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const ticket = await this.oauthClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new HttpException(
          'Unable to retrieve Google account email',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const email = payload.email;
      const domain = (email.split('@')[1] || '').toLowerCase();

      // Enforce existing users only
      const existingUser = await this.userModel.findOne({ email }).exec();
      if (!existingUser) {
        // Single-company model: check allowedDomains on the single company record
        let companyName: string | null = null;
        let domainAllowed = false;
        try {
          const company = await this.companyModel.findOne().exec();
          if (company && Array.isArray((company as any).allowedDomains)) {
            domainAllowed = (company as any).allowedDomains
              .map((d: string) => d.toLowerCase())
              .includes(domain);
            companyName = company.name;
          }
        } catch (_) {
          // no company configured; continue with generic handling
        }

        const genericDomains = new Set([
          'gmail.com',
          'yahoo.com',
          'outlook.com',
          'hotmail.com',
          'live.com',
          'msn.com',
          'icloud.com',
          'aol.com',
          'proton.me',
          'protonmail.com',
        ]);

        let message =
          'There is no account for this email created. Please contact an admin to create an account for you';
        if (!genericDomains.has(domain) && domainAllowed && companyName) {
          message = `Contact your IT department of ${companyName} to register an account for you`;
        }

        // Redirect back to frontend with error
        const redirect = process.env.FRONTEND_LOGIN_REDIRECT || 'http://localhost:3000/login';
        const url = new URL(redirect);
        url.searchParams.set('error', message);
        url.searchParams.set('email', email);
        return res.redirect(url.toString());
      }

      // Check if user is active
      if (!(existingUser as any).isActive) {
        const redirect = process.env.FRONTEND_LOGIN_REDIRECT || 'http://localhost:3000/login';
        const url = new URL(redirect);
        url.searchParams.set('error', 'Your account has been deactivated. Please contact an administrator.');
        return res.redirect(url.toString());
      }

      // User exists: issue our own JWT
      const token = this.authService.generateToken({
        sub: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        companyId: existingUser.companyId,
      });

      const redirectOk = process.env.FRONTEND_LOGIN_REDIRECT || 'http://localhost:3000/login';
      const okUrl = new URL(redirectOk);
      okUrl.searchParams.set('token', token);
      return res.redirect(okUrl.toString());
    } catch (error) {
      const redirect =
        process.env.FRONTEND_LOGIN_REDIRECT || 'http://localhost:3000/login';
      const url = new URL(redirect);
      const message =
        error instanceof Error ? error.message : 'Authentication failed';
      url.searchParams.set('error', message);
      return res.redirect(url.toString());
    }
  }
}
