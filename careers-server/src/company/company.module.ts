import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company, CompanySchema } from './company.schema';
import { HeadquartersController } from './headquarters.controller';
import { HeadquartersService } from './headquarters.service';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import {
  Headquarters,
  HeadquartersSchema,
} from './schemas/headquarters.schema';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: Headquarters.name, schema: HeadquartersSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
    AuthModule,
  ],
  controllers: [
    CompanyController,
    HeadquartersController,
    DepartmentController,
  ],
  providers: [CompanyService, HeadquartersService, DepartmentService],
  exports: [CompanyService, HeadquartersService, DepartmentService],
})
export class CompanyModule {}
