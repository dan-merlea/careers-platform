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
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Office.name, schema: OfficeSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
    AuthModule,
  ],
  controllers: [CompanyController, OfficesController, DepartmentController],
  providers: [CompanyService, OfficesService, DepartmentService],
  exports: [CompanyService, OfficesService, DepartmentService],
})
export class CompanyModule {}
