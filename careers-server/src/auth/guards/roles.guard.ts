import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';

interface RequestUser {
  userId: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // Type assertion to handle the request.user property safely
    const user = (request as { user?: RequestUser }).user;

    // If no user or no role, deny access
    if (!user || !user.role) {
      return false;
    }

    // Admin role has access to everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check if user's role is in the required roles
    return requiredRoles.includes(user.role);
  }
}
