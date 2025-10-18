import {
  Controller,
  Get,
  Post,
  Body,
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
  googleAuth(@Res() res: Response, @Query('calendar') calendar?: string) {
    this.logger.log('Starting Google OAuth flow...');
    
    // Include calendar scope if requested
    const scopes = ['openid', 'email', 'profile'];
    if (calendar === 'true') {
      scopes.push('https://www.googleapis.com/auth/calendar');
    }
    
    const url = this.oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: calendar === 'true' ? 'calendar' : undefined,
    });
    this.logger.log(`Redirecting to Google Auth URL: ${url}`);
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
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
      const isCalendarAuth = state === 'calendar';
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

      // If calendar auth, store tokens in user record
      if (isCalendarAuth && tokens.access_token && tokens.refresh_token) {
        await this.userModel.findByIdAndUpdate(existingUser._id, {
          googleAuth: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date || Date.now() + 3600000,
            scope: tokens.scope || 'calendar',
          },
        });
        
        // Redirect back to app with success - use stored return URL or default to homepage
        const redirectOk = process.env.FRONTEND_APP_URL || 'http://localhost:3000';
        const okUrl = new URL(redirectOk);
        okUrl.searchParams.set('googleCalendarConnected', 'true');
        okUrl.searchParams.set('timestamp', Date.now().toString()); // Force refresh
        return res.redirect(okUrl.toString());
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

  @Post('auth0/exchange')
  async auth0Exchange(
    @Body() body: { idToken: string; email: string; name?: string; sub: string },
  ) {
    try {
      const { email, name, sub } = body;

      if (!email || !sub) {
        throw new HttpException(
          'Missing required Auth0 user information',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Auth0 token exchange for email: ${email}`);

      // Find or create user based on Auth0 email
      let user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        // Check if domain is allowed
        const domain = (email.split('@')[1] || '').toLowerCase();
        const company = await this.companyModel.findOne({
          website: domain,
        }).exec();

        if (!company) {
          throw new HttpException(
            'Your email domain is not authorized. Please contact an administrator.',
            HttpStatus.FORBIDDEN,
          );
        }

        // Create new user with Auth0 sub
        user = await this.userModel.create({
          email,
          name: name || email.split('@')[0],
          role: 'user',
          isActive: true,
          auth0Sub: sub,
          companyId: company?._id,
        });

        this.logger.log(`Created new user from Auth0: ${email}`);
      } else {
        // Update existing user with Auth0 sub if not already set
        if (!(user as any).auth0Sub) {
          await this.userModel.findByIdAndUpdate(user._id, {
            auth0Sub: sub,
          });
        }
      }

      // Check if user is active
      if (!(user as any).isActive) {
        throw new HttpException(
          'Your account has been deactivated. Please contact an administrator.',
          HttpStatus.FORBIDDEN,
        );
      }

      // Generate JWT token
      const token = this.authService.generateToken({
        sub: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });

      // Get company info
      const company = user.companyId
        ? await this.companyModel.findById(user.companyId).exec()
        : null;

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          departmentId: user.departmentId,
          companyId: user.companyId,
        },
        company: company
          ? {
              id: company._id,
              name: company.name,
            }
          : null,
      };
    } catch (error) {
      this.logger.error('Auth0 token exchange error:', error);
      throw error;
    }
  }
}
