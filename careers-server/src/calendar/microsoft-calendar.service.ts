import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import {
  CalendarEvent,
  CalendarInviteResult,
} from './calendar-provider.service';
import { CalendarCredentialsService } from './calendar-credentials.service';
import { CalendarIntegrationType } from './dto/calendar-credentials.dto';

@Injectable()
export class MicrosoftCalendarService {
  private graphClient: Client | null = null;
  private readonly logger = new Logger(MicrosoftCalendarService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly calendarCredentialsService: CalendarCredentialsService,
  ) {}

  /**
   * Initialize Microsoft Graph client
   */
  private async initializeGraphClient(): Promise<void> {
    try {
      // Try to get credentials from database first
      const credentials = await this.calendarCredentialsService
        .findByType(CalendarIntegrationType.MICROSOFT)
        .catch(() => null);

      let tenantId = '';
      let clientId = '';
      let clientSecret = '';

      if (credentials) {
        // Use credentials from database
        tenantId = credentials.tenantId || '';
        clientId = credentials.clientId || '';
        clientSecret = credentials.clientSecret || '';
      } else {
        // Fall back to environment variables
        this.logger.warn(
          'No Microsoft Calendar credentials found in database, falling back to environment variables',
        );
        tenantId = this.configService.get<string>('MICROSOFT_TENANT_ID') || '';
        clientId = this.configService.get<string>('MICROSOFT_CLIENT_ID') || '';
        clientSecret =
          this.configService.get<string>('MICROSOFT_CLIENT_SECRET') || '';
      }

      if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Microsoft credentials not properly configured');
      }

      // Create credential
      const credential = new ClientSecretCredential(
        tenantId,
        clientId,
        clientSecret,
      );

      // Create auth provider
      const authProvider = new TokenCredentialAuthenticationProvider(
        credential,
        {
          scopes: ['https://graph.microsoft.com/.default'],
        },
      );

      // Create graph client
      this.graphClient = Client.initWithMiddleware({
        authProvider,
      });
    } catch (error) {
      this.logger.error('Failed to initialize Microsoft Graph client', error);
      throw new Error('Failed to initialize Microsoft Graph client');
    }
  }

  /**
   * Create a Microsoft Calendar event and return an invite
   */
  async createEvent(event: CalendarEvent): Promise<CalendarInviteResult> {
    try {
      // Initialize Graph client if not already initialized
      if (!this.graphClient) {
        await this.initializeGraphClient();
      }
      // Check if Graph client is initialized
      if (!this.graphClient) {
        throw new Error('Microsoft Graph client not initialized');
      }

      // Format attendees for Microsoft Graph API
      const attendees = event.attendees.map((attendee) => ({
        emailAddress: {
          address: attendee.email,
          name: attendee.name,
        },
        type: 'required',
      }));

      // Create the event
      const microsoftEvent = {
        subject: event.title,
        body: {
          contentType: 'text',
          content: event.description,
        },
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: 'UTC',
        },
        location: event.location
          ? {
              displayName: event.location,
            }
          : null,
        attendees,
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
      };

      // Insert the event
      const response = await this.graphClient
        .api('/me/events')
        .post(microsoftEvent);

      // Generate ICS file with Microsoft Teams link
      const eventId = response.id || `microsoft-${Date.now()}`;
      const webLink = response.webLink || '';
      const teamsLink = response.onlineMeeting?.joinUrl || '';

      const icsContent = this.generateIcsWithMicrosoftLink(
        event,
        eventId,
        webLink,
        teamsLink,
      );

      return {
        content: icsContent,
        contentType: 'text/calendar',
        filename: 'microsoft_calendar_invite.ics',
      };
    } catch (error) {
      console.error('Error creating Microsoft Calendar event:', error);

      // Fall back to standard ICS format
      return this.generateFallbackIcs(event);
    }
  }

  /**
   * Generate an ICS file with Microsoft Teams link
   */
  private generateIcsWithMicrosoftLink(
    event: CalendarEvent,
    microsoftEventId: string,
    webLink: string,
    teamsLink?: string,
  ): string {
    // Format dates for iCalendar (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
    };

    // Create the attendees list
    const attendees = event.attendees.map((attendee) => {
      const role = attendee.role || 'REQ-PARTICIPANT';
      return `ATTENDEE;ROLE=${role};PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${attendee.name}:mailto:${attendee.email}`;
    });

    // Add Microsoft Teams specific properties
    let description = event.description;

    if (webLink) {
      description += `\n\nView in Outlook: ${webLink}`;
    }

    if (teamsLink) {
      description += `\n\nJoin Microsoft Teams Meeting: ${teamsLink}`;
    }

    // Create the iCalendar content with Microsoft specific properties
    const iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Microsoft Corporation//Outlook 16.0 MIMEDIR//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${microsoftEventId}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      event.location ? `LOCATION:${event.location}` : '',
      teamsLink ? `URL:${teamsLink}` : '',
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
    ]
      .filter((line) => line !== '')
      .join('\r\n');

    return iCalContent;
  }

  /**
   * Generate a fallback ICS file when Microsoft Graph API fails
   */
  private generateFallbackIcs(event: CalendarEvent): CalendarInviteResult {
    // Format dates for iCalendar (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
    };

    // Create the attendees list
    const attendees = event.attendees.map((attendee) => {
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
    ]
      .filter((line) => line !== '')
      .join('\r\n');

    return {
      content: iCalContent,
      contentType: 'text/calendar',
      filename: 'interview_invite.ics',
    };
  }
}
