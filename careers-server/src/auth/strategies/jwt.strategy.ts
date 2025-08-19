import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../users/schemas/user.schema';

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
      secretOrKey: process.env.JWT_SECRET || 'careers_secret_key',
    });
  }

  // Remove async since there are no await operations
  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    role: UserRole;
  } {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
