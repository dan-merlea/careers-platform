import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationGeneratorService } from './notification-generator.service';
import { Reflector } from '@nestjs/core';

// Metadata key for notification actions
export const NOTIFICATION_ACTION = 'notification_action';

// Decorator to mark controller methods that should trigger notifications
export function NotifyOn(action: string) {
  return (target: object, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(NOTIFICATION_ACTION, action, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class NotificationInterceptor implements NestInterceptor {
  constructor(
    private readonly notificationGenerator: NotificationGeneratorService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        // Use a separate function to handle the async operations
        this.processNotification(context, data).catch((error) => {
          console.error('Error in notification interceptor:', error);
        });
      }),
    );
  }

  private async processNotification(
    context: ExecutionContext,
    data: any,
  ): Promise<void> {
    if (!data) return;

    const handler = context.getHandler();
    const notificationAction = this.reflector.get<string>(
      NOTIFICATION_ACTION,
      handler,
    );

    if (!notificationAction) {
      return; // No notification action defined for this endpoint
    }

    // Process based on the notification action
    switch (notificationAction) {
      case 'job_application_created':
        if (
          data &&
          typeof data.id === 'string' &&
          typeof data.jobId === 'string'
        ) {
          const firstName =
            typeof data.firstName === 'string' ? data.firstName : '';
          const lastName =
            typeof data.lastName === 'string' ? data.lastName : '';
          const applicantName = `${firstName} ${lastName}`;

          await this.notificationGenerator.notifyJobApplication(
            data.jobId,
            applicantName,
            data.id,
          );
        }
        break;

      // Add more notification types here as needed

      default:
        console.log(`Unknown notification action: ${notificationAction}`);
    }
  }
}
