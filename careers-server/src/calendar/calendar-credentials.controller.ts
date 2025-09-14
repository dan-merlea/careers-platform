import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CalendarCredentialsService } from './calendar-credentials.service';
import { CalendarCredentials } from './schemas/calendar-credentials.schema';
import { CalendarCredentialsDto, CalendarIntegrationType } from './dto/calendar-credentials.dto';

@Controller('calendar/credentials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CalendarCredentialsController {
  constructor(private readonly calendarCredentialsService: CalendarCredentialsService) {}

  @Get()
  async findAll(): Promise<CalendarCredentials[]> {
    return this.calendarCredentialsService.findAll();
  }

  @Get(':type')
  async findByType(@Param('type') type: CalendarIntegrationType): Promise<CalendarCredentials> {
    return this.calendarCredentialsService.findByType(type);
  }

  @Post()
  async save(@Body() credentialsDto: CalendarCredentialsDto): Promise<CalendarCredentials> {
    return this.calendarCredentialsService.save(credentialsDto);
  }

  @Delete(':type')
  async delete(@Param('type') type: CalendarIntegrationType): Promise<void> {
    return this.calendarCredentialsService.delete(type);
  }
}
