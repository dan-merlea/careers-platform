/**
 * Utility functions for date and time formatting
 */

/**
 * Format a date string to a localized date format
 * @param dateString - The date string to format
 * @param fallback - Optional fallback value if date is invalid (default: 'N/A')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date | undefined, fallback: string = 'N/A'): string => {
  if (!dateString) return fallback;
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return date.toLocaleDateString();
  } catch {
    // Silently handle parsing errors and return fallback value
    return fallback;
  }
};

/**
 * Format a date string to a localized time format
 * @param dateString - The date string to format
 * @param options - Optional time formatting options
 * @param fallback - Optional fallback value if date is invalid (default: '')
 * @returns Formatted time string
 */
export const formatTime = (
  dateString: string | Date | undefined, 
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
  fallback: string = ''
): string => {
  if (!dateString) return fallback;
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return date.toLocaleTimeString([], options);
  } catch {
    // Silently handle parsing errors and return fallback value
    return fallback;
  }
};

/**
 * Format a date string to a localized date and time format
 * @param dateString - The date string to format
 * @param fallback - Optional fallback value if date is invalid (default: 'N/A')
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date | undefined, fallback: string = 'N/A'): string => {
  if (!dateString) return fallback;
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return date.toLocaleString();
  } catch {
    // Silently handle parsing errors and return fallback value
    return fallback;
  }
};

/**
 * Format a date to a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param dateString - The date string to format
 * @param fallback - Optional fallback value if date is invalid (default: 'N/A')
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string | Date | undefined, fallback: string = 'N/A'): string => {
  if (!dateString) return fallback;
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date);
    }
  } catch {
    // Silently handle parsing errors and return fallback value
    return fallback;
  }
};
