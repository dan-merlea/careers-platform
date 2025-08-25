import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
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
  create(@Body() createOfficeDto: CreateOfficeDto) {
    return this.officesService.create(createOfficeDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findAll() {
    return this.officesService.findAll();
  }

  @Get('main')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER, UserRole.USER)
  getMainOffice() {
    return this.officesService.getMainOffice();
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
