import { Body, Controller, Get, Post, Put, UseGuards, Req, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Get(':companyId/public')
  async getPublicCompanyInfo(@Param('companyId') companyId: string) {
    try {
      const company = await this.companyService.getCompanyDetails(companyId);
      // Return only public information
      return {
        companyName: company.name,
        logo: company.logo,
        website: company.website,
        industry: company.industry,
        description: company.description,
      };
    } catch {
      return { statusCode: 404, message: 'Company not found' };
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

  @Post('upload-logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('logo'))
  @LogAction('upload_company_logo', 'company')
  async uploadLogo(
    @Req() req: Request & { user: { companyId: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate MIME type to prevent script uploads
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PNG, JPG, SVG, and WebP images are allowed.');
    }

    // Validate file size (max 1MB)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 1MB limit.');
    }

    return this.companyService.uploadLogo(req.user.companyId, file);
  }
}
