import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {
  CalendarEvent,
  CalendarInviteResult,
} from './calendar-provider.service';
import { CalendarCredentialsService } from './calendar-credentials.service';
import { CalendarIntegrationType } from './dto/calendar-credentials.dto';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly calendarCredentialsService: CalendarCredentialsService,
  ) {}

  private async initializeGoogleClient(): Promise<void> {
    try {
      // Try to get credentials from database first
      const credentials = await this.calendarCredentialsService
        .findByType(CalendarIntegrationType.GOOGLE)
        .catch(() => null);

      if (credentials) {
        // Use credentials from database
        this.oauth2Client = new google.auth.OAuth2(
          credentials.clientId,
          credentials.clientSecret,
          credentials.redirectUri,
        );

        // Set credentials
        this.oauth2Client.setCredentials({
          refresh_token: credentials.refreshToken,
        });
      } else {
        // Fall back to environment variables
        this.logger.warn(
          'No Google Calendar credentials found in database, falling back to environment variables',
        );
        this.oauth2Client = new google.auth.OAuth2(
          this.configService.get<string>('GOOGLE_CLIENT_ID'),
          this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
          this.configService.get<string>('GOOGLE_REDIRECT_URI'),
        );

        // Set credentials
        const refreshToken = this.configService.get<string>(
          'GOOGLE_REFRESH_TOKEN',
        );
        this.oauth2Client.setCredentials({
          refresh_token: refreshToken,
        });
      }

      // Create calendar client
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });
    } catch (error) {
      this.logger.error('Failed to initialize Google Calendar client', error);
      throw new Error('Failed to initialize Google Calendar client');
    }
  }

  /**
   * Create a Google Calendar event and return an invite
   */
  async createEvent(event: CalendarEvent): Promise<CalendarInviteResult> {
    try {
      // Initialize Google client if not already initialized
      if (!this.calendar) {
        await this.initializeGoogleClient();
      }

      // Check if we have valid credentials
      if (!this.oauth2Client.credentials.refresh_token) {
        throw new Error('Google Calendar credentials not configured');
      }

      // Format attendees for Google Calendar API
      const attendees = event.attendees.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.name,
        responseStatus: 'needsAction',
      }));

      // Create the event
      const googleEvent = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: 'UTC',
        },
        attendees,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
        sendUpdates: 'all', // Send emails to attendees
      };

      // Insert the event
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: googleEvent,
        sendNotifications: true,
      });

      // Generate ICS file with Google Calendar event ID
      // Use the original event UID if available to ensure consistency across calendar providers
      // Otherwise, create a Google Calendar specific ID
      const googleEventId = response.data.id || `google-${Date.now()}`;
      const eventLink = response.data.htmlLink || '';
      // Use the event's original UID to ensure consistency when re-downloading
      const icsContent = this.generateIcsWithGoogleLink(
        event,
        event.uid || `interview-${googleEventId}@careers-platform`,
        eventLink,
      );

      return {
        content: icsContent,
        contentType: 'text/calendar',
        filename: 'google_calendar_invite.ics',
      };
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);

      // Fall back to standard ICS format
      return this.generateFallbackIcs(event);
    }
  }

  /**
   * Generate an ICS file with Google Calendar link
   */
  private generateIcsWithGoogleLink(
    event: CalendarEvent,
    googleEventId: string,
    googleEventLink: string,
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

    // Add Google Calendar specific properties and meeting details
    let description = `${event.description}\n\nView in Google Calendar: ${googleEventLink}`;

    // Add meeting details if available
    if (event.onlineMeetingUrl) {
      description += `\n\nMeeting URL: ${event.onlineMeetingUrl}`;
    }

    if (event.meetingId) {
      description += `\n\nMeeting ID: ${event.meetingId}`;
    }

    if (event.meetingPassword) {
      description += `\n\nPassword: ${event.meetingPassword}`;
    }

    // Create the iCalendar content with Google Calendar specific properties
    const iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Google Inc//Google Calendar 70.9054//EN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${googleEventId}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
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

    return iCalContent;
  }

  /**
   * Generate a fallback ICS file when Google Calendar API fails
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

    // Enhance description with meeting details if available
    let enhancedDescription = event.description;

    // Add meeting details if available
    if (event.onlineMeetingUrl) {
      enhancedDescription += `\n\nMeeting URL: ${event.onlineMeetingUrl}`;
    }

    if (event.meetingId) {
      enhancedDescription += `\n\nMeeting ID: ${event.meetingId}`;
    }

    if (event.meetingPassword) {
      enhancedDescription += `\n\nPassword: ${event.meetingPassword}`;
    }

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
      `DESCRIPTION:${enhancedDescription.replace(/\n/g, '\\n')}`,
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
