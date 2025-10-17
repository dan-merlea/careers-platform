import { Module } from '@nestjs/common';
import { PublicApiController } from './public-api.controller';
import { JobApplicationsModule } from '../job-applications/job-applications.module';
import { CompanyModule } from '../company/company.module';
import { JobBoardsModule } from '../job-boards/job-boards.module';
import { JobModule } from '../job/job.module';

@Module({
  imports: [
    JobApplicationsModule,
    CompanyModule,
    JobBoardsModule,
    JobModule,
  ],
  controllers: [PublicApiController],
})
export class PublicApiModule {}
