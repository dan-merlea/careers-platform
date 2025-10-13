import { Controller, Post, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { CompanySignupsService } from './company-signups.service';
import { CreateCompanySignupDto } from './dto/create-company-signup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('company-signups')
export class CompanySignupsController {
  constructor(private readonly companySignupsService: CompanySignupsService) {}

  @Post()
  async create(@Body() createDto: CreateCompanySignupDto) {
    return this.companySignupsService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.companySignupsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findById(@Param('id') id: string) {
    return this.companySignupsService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('userId') userId?: string,
  ) {
    return this.companySignupsService.updateStatus(id, status, userId);
  }

  @Patch(':id/notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async addNotes(@Param('id') id: string, @Body('notes') notes: string) {
    return this.companySignupsService.addNotes(id, notes);
  }
}
