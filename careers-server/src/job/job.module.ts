import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobTemplateService } from './job-template.service';
import { JobTemplateController } from './job-template.controller';
import { Job, JobSchema } from './job.entity';
import { JobTemplate, JobTemplateSchema } from './schemas/job-template.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import {
  Department,
  DepartmentSchema,
} from '../company/schemas/department.schema';
import { Office, OfficeSchema } from '../company/schemas/office.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Office.name, schema: OfficeSchema },
    ]),
  ],
  controllers: [JobController, JobTemplateController],
  providers: [JobService, JobTemplateService],
  exports: [JobService, JobTemplateService],
})
export class JobModule {}
