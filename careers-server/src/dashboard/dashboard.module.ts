import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  JobApplication,
  JobApplicationSchema,
} from '../job-applications/schemas/job-application.schema';
import { Job, JobSchema } from '../job/job.entity';
import {
  HeadcountRequest,
  HeadcountRequestSchema,
} from '../headcount/headcount-request.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: HeadcountRequest.name, schema: HeadcountRequestSchema },
    ]),
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
