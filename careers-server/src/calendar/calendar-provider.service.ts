import { Injectable } from '@nestjs/common';
import { CompanyService } from '../company/company.service';
import { EmailCalendarProvider } from '../company/dto/company-settings.dto';
import { GoogleCalendarService } from './google-calendar.service';
import { MicrosoftCalendarService } from './microsoft-calendar.service';

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  attendees: Array<{
    name: string;
    email: string;
    role?: 'CHAIR' | 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT';
  }>;
  location?: string;
  onlineMeetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
}

export interface CalendarInviteResult {
  content: string;
  contentType: string;
  filename: string;
}

@Injectable()
export class CalendarProviderService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly microsoftCalendarService: MicrosoftCalendarService
  ) {}

  /**
   * Generate a calendar invite based on the company's email/calendar provider
   */
  async generateInvite(event: CalendarEvent): Promise<CalendarInviteResult> {
    // Get the company's email/calendar provider setting
    const company = await this.companyService.getCompanyDetails();
    const provider = company.settings?.emailCalendarProvider || 'other';

    try {
      switch (provider) {
        case EmailCalendarProvider.GOOGLE:
          return await this.googleCalendarService.createEvent(event);
        case EmailCalendarProvider.MICROSOFT:
          return await this.microsoftCalendarService.createEvent(event);
        default:
          return this.generateIcsInvite(event);
      }
    } catch (error) {
      console.error(`Error generating invite with provider ${provider}:`, error);
      // Fall back to standard ICS format if provider-specific integration fails
      return this.generateIcsInvite(event);
    }
  }

  /**
   * Generate a standard ICS invite (for 'other' providers)
   */
  private generateIcsInvite(event: CalendarEvent): CalendarInviteResult {
    // Format dates for iCalendar (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
    };

    // Create the attendees list
    const attendees = event.attendees.map(attendee => {
      const role = attendee.role || 'REQ-PARTICIPANT';
      return `ATTENDEE;ROLE=${role};PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${attendee.name}:mailto:${attendee.email}`;
    });

    // Create the iCalendar content
    const iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Careers Platform//Interview//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      event.location ? `LOCATION:${event.location}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      ...attendees,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(line => line !== '').join('\r\n');

    return {
      content: iCalContent,
      contentType: 'text/calendar',
      filename: 'interview_invite.ics',
    };
  }
}
