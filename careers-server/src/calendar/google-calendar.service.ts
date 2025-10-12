import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {
  CalendarEvent,
  CalendarInviteResult,
} from './calendar-provider.service';

export interface GoogleUserTokens {
  accessToken: string; 
  refreshToken: string; 
  expiryDate: number;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private readonly configService: ConfigService) {}

  private createGoogleClientWithUserTokens(userTokens: GoogleUserTokens): { oauth2Client: OAuth2Client; calendar: calendar_v3.Calendar } {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    // Set user-specific credentials
    oauth2Client.setCredentials({
      access_token: userTokens.accessToken,
      refresh_token: userTokens.refreshToken,
      expiry_date: userTokens.expiryDate,
    });

    // Create calendar client
    const calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });

    return { oauth2Client, calendar };
  }

  /**
   * Create a Google Calendar event and return an invite
   */
  async createEvent(event: CalendarEvent, userTokens: GoogleUserTokens): Promise<CalendarInviteResult> {
    try {
      if (userTokens.expiryDate < Date.now()) {
        throw new Error('GOOGLE_AUTH_EXPIRED');
      }

      // Create a new client for this request
      const { oauth2Client, calendar } = this.createGoogleClientWithUserTokens(userTokens);

      // Check if we have valid credentials
      if (!oauth2Client.credentials.refresh_token) {
        throw new Error('Google Calendar credentials not configured');
      }

      // Format attendees for Google Calendar API
      const attendees = event.attendees.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.name,
        responseStatus: 'needsAction',
      }));

      // Create the event with conference data request
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
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      };

      // Create the event in Google Calendar with sendUpdates to send email invites
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: googleEvent,
        conferenceDataVersion: 1,
        sendUpdates: 'all', // Send email invitations to all attendees
      });

      console.log('Google Calendar Event Response:', JSON.stringify(response.data, null, 2));

      // Extract Google Meet details from response
      const googleEventId = response.data.id || `google-${Date.now()}`;
      const eventLink = response.data.htmlLink || '';
      const meetLink = response.data.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video'
      )?.uri || '';
      const conferenceId = response.data.conferenceData?.conferenceId || '';

      // Update event with Google Meet details
      const eventWithMeet = {
        ...event,
        onlineMeetingUrl: meetLink,
        meetingId: conferenceId,
      };

      // Use the event's original UID to ensure consistency when re-downloading
      const icsContent = this.generateIcsWithGoogleLink(
        eventWithMeet,
        event.uid || `interview-${googleEventId}@careers-platform`,
        eventLink,
      );

      return {
        content: icsContent,
        contentType: 'text/calendar',
        filename: 'google_calendar_invite.ics',
        googleEventId,
        googleMeetLink: meetLink,
        googleConferenceId: conferenceId,
      };
    } catch (error) {
      this.logger.error('Error creating Google Calendar event:', error);
      
      // Check for invalid_grant error (expired/revoked tokens)
      if (error.message?.includes('invalid_grant') || error.response?.data?.error === 'invalid_grant') {
        this.logger.error('Google OAuth refresh token is invalid or expired. User needs to re-authenticate.');
        // Throw a specific error that can be caught by the caller
        throw new Error('GOOGLE_AUTH_EXPIRED');
      }

      // Fall back to standard ICS format for other errors
      return this.generateFallbackIcs(event);
    }
  }

  /**
   * Update an existing Google Calendar event
   */
  async updateEvent(
    googleEventId: string,
    event: CalendarEvent,
    userTokens: GoogleUserTokens,
  ): Promise<CalendarInviteResult> {
    try {
      if (userTokens.expiryDate < Date.now()) {
        throw new Error('GOOGLE_AUTH_EXPIRED');
      }

      // Create a new client for this request
      const { oauth2Client, calendar } = this.createGoogleClientWithUserTokens(userTokens);

      // Check if we have valid credentials
      if (!oauth2Client.credentials.refresh_token) {
        throw new Error('Google Calendar credentials not configured');
      }

      // Format attendees for Google Calendar API
      const attendees = event.attendees.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.name,
        responseStatus: 'needsAction',
      }));

      // Update the event
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
      };

      // Update the event in Google Calendar with sendUpdates to notify attendees
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: googleEvent,
        sendUpdates: 'all', // Send email notifications to all attendees
      });

      console.log('Google Calendar Event Updated:', JSON.stringify(response.data, null, 2));

      // Extract Google Meet details from response
      const eventLink = response.data.htmlLink || '';
      const meetLink = response.data.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video'
      )?.uri || '';
      const conferenceId = response.data.conferenceData?.conferenceId || '';

      // Update event with Google Meet details
      const eventWithMeet = {
        ...event,
        onlineMeetingUrl: meetLink,
        meetingId: conferenceId,
      };

      // Use the event's original UID to ensure consistency
      const icsContent = this.generateIcsWithGoogleLink(
        eventWithMeet,
        event.uid || `interview-${googleEventId}@careers-platform`,
        eventLink,
      );

      return {
        content: icsContent,
        contentType: 'text/calendar',
        filename: 'google_calendar_invite.ics',
        googleEventId,
        googleMeetLink: meetLink,
        googleConferenceId: conferenceId,
      };
    } catch (error) {
      this.logger.error('Error updating Google Calendar event:', error);
      
      // Check for invalid_grant error (expired/revoked tokens)
      if (error.message?.includes('invalid_grant') || error.response?.data?.error === 'invalid_grant') {
        this.logger.error('Google OAuth refresh token is invalid or expired. User needs to re-authenticate.');
        throw new Error('GOOGLE_AUTH_EXPIRED');
      }

      // If event not found, throw specific error
      if (error.response?.status === 404) {
        throw new NotFoundException('Google Calendar event not found');
      }

      throw error;
    }
  }

  /**
   * Get event details from Google Calendar
   */
  async getEvent(
    googleEventId: string,
    userTokens: GoogleUserTokens,
  ): Promise<any> {
    try {
      if (userTokens.expiryDate < Date.now()) {
        throw new Error('GOOGLE_AUTH_EXPIRED');
      }

      // Create a new client for this request
      const { oauth2Client, calendar } = this.createGoogleClientWithUserTokens(userTokens);

      // Check if we have valid credentials
      if (!oauth2Client.credentials.refresh_token) {
        throw new Error('Google Calendar credentials not configured');
      }

      // Get the event from Google Calendar
      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      const event = response.data;

      // Extract meeting details
      const meetLink = event.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video'
      )?.uri || '';
      
      const conferenceId = event.conferenceData?.conferenceId || '';
      const eventLink = event.htmlLink || '';

      return {
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        attendees: event.attendees,
        htmlLink: eventLink,
        meetLink: meetLink,
        conferenceId: conferenceId,
        conferenceData: event.conferenceData,
      };
    } catch (error) {
      this.logger.error('Error fetching Google Calendar event:', error);
      
      // Check for invalid_grant error (expired/revoked tokens)
      if (error.message?.includes('invalid_grant') || error.response?.data?.error === 'invalid_grant') {
        this.logger.error('Google OAuth refresh token is invalid or expired. User needs to re-authenticate.');
        throw new Error('GOOGLE_AUTH_EXPIRED');
      }

      // If event not found, throw specific error
      if (error.response?.status === 404) {
        throw new NotFoundException('Google Calendar event not found');
      }

      throw error;
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
