/**
 * API utility for making authenticated requests
 * This utility automatically includes the JWT token in all requests
 */

import { API_URL } from '../config';

// Define a custom event for session expiration
export const SESSION_EXPIRED_EVENT = 'session_expired';

const API_BASE_URL = API_URL;

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Get the company ID from localStorage
 */
export const getCompanyId = (): string | null => {
  return localStorage.getItem('companyId');
};

/**
 * Get the company name from localStorage
 */
export const getCompanyName = (): string | null => {
  return localStorage.getItem('companyName');
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Clear authentication data (for logout)
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userDepartment');
  localStorage.removeItem('companyId');
  localStorage.removeItem('companyName');
};

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Promise with response data
 */
export const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  // Don't set Content-Type for FormData, browser will set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized errors (token expired or invalid)
  if (response.status === 401) {
    clearAuth();
    
    // Dispatch a custom event for session expiration
    const sessionExpiredEvent = new CustomEvent(SESSION_EXPIRED_EVENT);
    window.dispatchEvent(sessionExpiredEvent);
    
    throw new Error('Authentication expired. Please log in again.');
  }

  // For all other error responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  // For 204 No Content responses, return an empty object
  if (response.status === 204) {
    return {} as T;
  }
  
  // For all other successful responses, try to parse JSON
  try {
    return await response.json();
  } catch {
    // If parsing fails (e.g., empty body), return empty object
    return {} as T;
  }
};

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    }),
    
  put: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
