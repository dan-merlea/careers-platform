import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { OfficesService } from './offices.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('company/offices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() createOfficeDto: CreateOfficeDto,
    @Req() req: Request & { user: { companyId: string } },
  ) {
    // Create a new office with the company ID from the authenticated user
    return this.officesService.create(createOfficeDto, req.user.companyId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findAll(@Req() req: Request & { user: { companyId: string } }) {
    return this.officesService.findAll(req.user.companyId);
  }

  @Get('main')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER, UserRole.USER)
  getMainOffice(@Req() req: Request & { user: { companyId: string } }) {
    return this.officesService.getMainOffice(req.user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findOne(@Param('id') id: string) {
    return this.officesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto) {
    return this.officesService.update(id, updateOfficeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.officesService.remove(id);
  }
}
