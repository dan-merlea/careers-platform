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
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { JobRole, JobRoleSchema } from '../company/schemas/job-role.schema';
import { InterviewProcess, InterviewProcessSchema } from '../interviews/interview-process.entity';
import { Department, DepartmentSchema } from '../company/schemas/department.schema';
import { CalendarCredentials, CalendarCredentialsSchema } from '../calendar/schemas/calendar-credentials.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: HeadcountRequest.name, schema: HeadcountRequestSchema },
      { name: Company.name, schema: CompanySchema },
      { name: JobRole.name, schema: JobRoleSchema },
      { name: InterviewProcess.name, schema: InterviewProcessSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: CalendarCredentials.name, schema: CalendarCredentialsSchema },
    ]),
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
