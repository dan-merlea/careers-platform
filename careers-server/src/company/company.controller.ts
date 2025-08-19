import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRole } from '../users/schemas/user.schema';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async getCompanyDetails() {
    try {
      return await this.companyService.getCompanyDetails();
    } catch {
      // Return 404 to the frontend which will handle it by showing empty form
      return { statusCode: 404, message: 'Company details not found' };
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async saveCompanyDetails(@Body() companyDto: CompanyDto) {
    return this.companyService.saveCompanyDetails(companyDto);
  }
}
