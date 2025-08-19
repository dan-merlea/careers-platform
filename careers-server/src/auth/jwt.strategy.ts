import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../users/schemas/user.schema';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // In production, use environment variable
    });
  }

  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    role: UserRole;
  } {
    // Return user information from JWT payload
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
