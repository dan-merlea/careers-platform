import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplication, JobApplicationSchema } from './schemas/job-application.schema';
import { GridFsModule } from '../gridfs/gridfs.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    MulterModule.register({}),
    GridFsModule,
    CalendarModule,
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
