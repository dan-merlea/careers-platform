import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company, CompanySchema } from './company.schema';
import { OfficesController } from './offices.controller';
import { OfficesService } from './offices.service';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { Office, OfficeSchema } from './schemas/office.schema';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { JobFunction, JobFunctionSchema } from './schemas/job-function.schema';
import { JobRole, JobRoleSchema } from './schemas/job-role.schema';
import { JobFunctionController } from './job-function.controller';
import { JobRoleController } from './job-role.controller';
import { JobFunctionService } from './job-function.service';
import { JobRoleService } from './job-role.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Office.name, schema: OfficeSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: JobFunction.name, schema: JobFunctionSchema },
      { name: JobRole.name, schema: JobRoleSchema },
    ]),
    AuthModule,
  ],
  controllers: [
    CompanyController,
    OfficesController,
    DepartmentController,
    JobFunctionController,
    JobRoleController,
  ],
  providers: [
    CompanyService,
    OfficesService,
    DepartmentService,
    JobFunctionService,
    JobRoleService,
  ],
  exports: [
    CompanyService,
    OfficesService,
    DepartmentService,
    JobFunctionService,
    JobRoleService,
  ],
})
export class CompanyModule {}
