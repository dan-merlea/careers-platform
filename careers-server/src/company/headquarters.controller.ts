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
import { HeadquartersService } from './headquarters.service';
import { CreateHeadquartersDto } from './dto/create-headquarters.dto';
import { UpdateHeadquartersDto } from './dto/update-headquarters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('company/headquarters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HeadquartersController {
  constructor(private readonly headquartersService: HeadquartersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createHeadquartersDto: CreateHeadquartersDto) {
    return this.headquartersService.create(createHeadquartersDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findAll() {
    return this.headquartersService.findAll();
  }

  @Get('main')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER, UserRole.USER)
  getMainHeadquarters() {
    return this.headquartersService.getMainHeadquarters();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECRUITER)
  findOne(@Param('id') id: string) {
    return this.headquartersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateHeadquartersDto: UpdateHeadquartersDto,
  ) {
    return this.headquartersService.update(id, updateHeadquartersDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.headquartersService.remove(id);
  }
}
