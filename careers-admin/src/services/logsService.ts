import { api } from '../utils/api';

export interface UserLog {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: {
    method: string;
    path: string;
    query: Record<string, any>;
    body: Record<string, any>;
  };
  ip?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogsResponse {
  logs: UserLog[];
  total: number;
}

export interface LogsFilter {
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch all logs with pagination
 */
export const fetchLogs = async (page = 1, limit = 20, filter?: LogsFilter): Promise<LogsResponse> => {
  let queryParams = `page=${page}&limit=${limit}`;
  
  if (filter) {
    if (filter.userId) queryParams += `&userId=${filter.userId}`;
    if (filter.resourceType) queryParams += `&resourceType=${filter.resourceType}`;
    if (filter.resourceId) queryParams += `&resourceId=${filter.resourceId}`;
    if (filter.action) queryParams += `&action=${filter.action}`;
    if (filter.startDate) queryParams += `&startDate=${filter.startDate}`;
    if (filter.endDate) queryParams += `&endDate=${filter.endDate}`;
  }
  
  return api.get<LogsResponse>(`/user-logs?${queryParams}`);
};

/**
 * Fetch logs for a specific user
 */
export const fetchUserLogs = async (userId: string): Promise<UserLog[]> => {
  return api.get<UserLog[]>(`/user-logs/user/${userId}`);
};

/**
 * Fetch logs for a specific resource
 */
export const fetchResourceLogs = async (resourceType: string, resourceId: string): Promise<UserLog[]> => {
  return api.get<UserLog[]>(`/user-logs/resource/${resourceType}/${resourceId}`);
};

/**
 * Get a human-readable description for a log entry
 */
export const getLogDescription = (log: UserLog): string => {
  // Map action types to user-friendly descriptions
  const actionMap: Record<string, string> = {
    create_application: 'Created job application',
    update_application_status: 'Updated application status',
    delete_application: 'Deleted job application',
    add_note: 'Added a note',
    update_note: 'Updated a note',
    delete_note: 'Deleted a note',
    schedule_interview: 'Scheduled an interview',
    update_interviewer_visibility: 'Updated interviewer visibility',
    // Add more mappings as needed
  };

  // Map resource types to user-friendly names
  const resourceMap: Record<string, string> = {
    job_application: 'job application',
    job_application_note: 'note',
    job_application_interview: 'interview',
    // Add more mappings as needed
  };

  // Get the base description
  let description = actionMap[log.action] || log.action;
  
  // Add resource type if available
  if (log.resourceType && resourceMap[log.resourceType]) {
    if (!actionMap[log.action]) {
      // If we don't have a mapped action, create a generic description
      description = `${log.action.replace(/_/g, ' ')} ${resourceMap[log.resourceType]}`;
    }
  }

  // Add resource ID if available (could be enhanced to fetch actual resource names)
  if (log.resourceId) {
    description += ` (ID: ${log.resourceId})`;
  }

  return description;
};

/**
 * Get a user-friendly timestamp
 */
export const formatLogTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
