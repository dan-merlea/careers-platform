import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplication, JobApplicationSchema } from './schemas/job-application.schema';
import { GridFsModule } from '../gridfs/gridfs.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Job, JobSchema } from '../job/job.entity';
import { CalendarModule } from '../calendar/calendar.module';
import { CompanyModule } from '../company/company.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: User.name, schema: UserSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    MulterModule.register({}),
    GridFsModule,
    CalendarModule,
    CompanyModule,
    NotificationsModule,
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
