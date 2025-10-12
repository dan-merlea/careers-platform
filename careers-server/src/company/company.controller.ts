import { Body, Controller, Get, Post, Put, UseGuards, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/company.dto';
import { CompanySettingsDto } from './dto/company-settings.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRole } from '../users/schemas/user.schema';
import { LogAction } from 'src/user-logs/user-logs.interceptor';
import { Request } from 'express';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCompanyDetails(@Req() req: Request & { user: { companyId: string } }) {
    try {
      return await this.companyService.getCompanyDetails(req.user.companyId);
    } catch {
      // Return 404 to the frontend which will handle it by showing empty form
      return { statusCode: 404, message: 'Company details not found' };
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @LogAction('save_company_details', 'company')
  async saveCompanyDetails(
    @Req() req: Request & { user: { companyId: string } },
    @Body() companyDto: CompanyDto,
  ) {
    return this.companyService.saveCompanyDetails(req.user.companyId, companyDto);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @LogAction('update_company_settings', 'company')
  async updateCompanySettings(
    @Req() req: Request & { user: { companyId: string } },
    @Body() settingsDto: CompanySettingsDto,
  ) {
    return this.companyService.updateCompanySettings(req.user.companyId, settingsDto);
  }
}
