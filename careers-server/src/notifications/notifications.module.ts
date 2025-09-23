import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationGeneratorService } from './notification-generator.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Job, JobSchema } from '../job/job.entity';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationGeneratorService],
  exports: [NotificationsService, NotificationGeneratorService],
})
export class NotificationsModule {}
