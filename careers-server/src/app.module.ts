import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { CompanyModule } from './company/company.module';
import { JobBoardsModule } from './job-boards/job-boards.module';
import { JobModule } from './job/job.module';
import { HeadcountModule } from './headcount/headcount.module';
import { JobApplicationsModule } from './job-applications/job-applications.module';
import { InterviewsModule } from './interviews/interviews.module';
import { UserLogsModule } from './user-logs/user-logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserLogsInterceptor } from './user-logs/user-logs.interceptor';
import { NotificationInterceptor } from './notifications/notification.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/dev_careers'),
    UsersModule,
    ApiKeysModule,
    CompanyModule,
    JobBoardsModule,
    JobModule,
    HeadcountModule,
    JobApplicationsModule,
    InterviewsModule,
    UserLogsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserLogsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: NotificationInterceptor,
    },
  ],
})
export class AppModule {}
