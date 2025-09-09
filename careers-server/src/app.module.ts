import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/dev_careers'),
    UsersModule,
    ApiKeysModule,
    CompanyModule,
    JobBoardsModule,
    JobModule,
    HeadcountModule,
    JobApplicationsModule,
    InterviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
