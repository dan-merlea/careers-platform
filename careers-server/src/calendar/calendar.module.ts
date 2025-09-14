import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendarProviderService } from './calendar-provider.service';
import { GoogleCalendarService } from './google-calendar.service';
import { MicrosoftCalendarService } from './microsoft-calendar.service';
import { CalendarCredentialsService } from './calendar-credentials.service';
import { CalendarCredentialsController } from './calendar-credentials.controller';
import { CalendarCredentials, CalendarCredentialsSchema } from './schemas/calendar-credentials.schema';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    CompanyModule, 
    ConfigModule,
    MongooseModule.forFeature([
      { name: CalendarCredentials.name, schema: CalendarCredentialsSchema },
    ]),
  ],
  controllers: [CalendarCredentialsController],
  providers: [
    CalendarProviderService,
    GoogleCalendarService,
    MicrosoftCalendarService,
    CalendarCredentialsService
  ],
  exports: [CalendarProviderService, CalendarCredentialsService],
})
export class CalendarModule {}
