import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserLogsService } from './user-logs.service';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RequestUser {
  id?: string;
  sub?: string;
  [key: string]: any;
}

export const LogAction = (action: string, resourceType: string) => {
  return (
    // Use any for target to allow it to work with any class type
    target: any,
    key: string,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata('logAction', action, descriptor.value);
    Reflect.defineMetadata('resourceType', resourceType, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class UserLogsInterceptor implements NestInterceptor {
  constructor(
    private readonly userLogsService: UserLogsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();

    // Skip logging for GET requests (read operations)
    if (request.method === 'GET') {
      return next.handle();
    }

    // Get metadata from handler
    const action = this.reflector.get<string>('logAction', handler);
    const resourceType = this.reflector.get<string>('resourceType', handler);

    // If no action is defined, skip logging
    if (!action || !resourceType) {
      return next.handle();
    }

    // Extract user ID from request (assuming JWT authentication)
    const userId = request.user
      ? ((request.user as RequestUser).id || (request.user as RequestUser).sub || 'anonymous')
      : 'anonymous';

    // Extract resource ID from params or body
    const resourceId = request.params?.id ||
      (request.body && typeof request.body === 'object'
        ? ((request.body as Record<string, unknown>).id as string | undefined)
        : undefined) ||
      (typeof request.query === 'object'
        ? ((request.query as Record<string, unknown>).id as string | undefined)
        : undefined) || '';

    // Process the request and log after it's complete
    return next.handle().pipe(
      tap(() => {
        // Create log entry
        this.userLogsService.createLog({
          userId,
          action,
          resourceType,
          resourceId,
          details: {
            method: request.method,
            path: request.path,
            query: request.query,
            body: this.sanitizeBody(request.body as Record<string, unknown>),
          },
          request,
        })
          .catch((err) => {
            console.error('Error creating log entry:', err);
          });
      }),
    );
  }

  // Remove sensitive information from request body
  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return {};

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
