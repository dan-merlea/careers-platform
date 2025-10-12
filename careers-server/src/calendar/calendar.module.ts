import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarProviderService } from './calendar-provider.service';
import { GoogleCalendarService } from './google-calendar.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    CompanyModule, 
    ConfigModule,
  ],
  controllers: [],
  providers: [
    CalendarProviderService,
    GoogleCalendarService,
  ],
  exports: [CalendarProviderService, GoogleCalendarService],
})
export class CalendarModule {}
