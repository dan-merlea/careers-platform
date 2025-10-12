import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewProcess, InterviewProcessSchema } from './interview-process.entity';
import { InterviewProcessService } from './interview-process.service';
import { InterviewProcessController } from './interview-process.controller';
import { InterviewsController } from './interviews.controller';
import { InterviewFeedbackController } from './interview-feedback.controller';
import { InterviewsService } from './interviews.service';
import { JobApplication, JobApplicationSchema } from '../job-applications/schemas/job-application.schema';
import { Job, JobSchema } from '../job/job.entity';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CalendarModule } from '../calendar/calendar.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InterviewProcess.name, schema: InterviewProcessSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CalendarModule,
    CompanyModule,
  ],
  controllers: [InterviewProcessController, InterviewsController, InterviewFeedbackController],
  providers: [InterviewProcessService, InterviewsService],
  exports: [InterviewProcessService, InterviewsService],
})
export class InterviewsModule {}
