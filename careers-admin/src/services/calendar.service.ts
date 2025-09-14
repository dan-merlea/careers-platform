import { api } from './api';
import { CalendarCredentials } from '../components/integrations/CalendarIntegrationForm';

export const calendarService = {
  /**
   * Get all calendar credentials
   */
  async getCredentials(): Promise<CalendarCredentials[]> {
    return api.get<CalendarCredentials[]>('/calendar/credentials');
  },

  /**
   * Save calendar credentials
   */
  async saveCredentials(credentials: CalendarCredentials): Promise<CalendarCredentials> {
    return api.post<CalendarCredentials>('/calendar/credentials', credentials);
  },

  /**
   * Delete calendar credentials
   */
  async deleteCredentials(type: string): Promise<void> {
    return api.delete(`/calendar/credentials/${type}`);
  }
};
