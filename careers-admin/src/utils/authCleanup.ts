/**
 * Utility functions for complete authentication cleanup
 */

/**
 * Completely clears all authentication-related data from localStorage
 * Use this function when experiencing authentication issues or stale data
 */
export const clearAllAuthData = (): void => {
  // Clear specific auth items
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  
  // Clear any other potential auth-related items
  // Add any additional items that might be stored for auth purposes
};

/**
 * Force logout and redirect to login page
 * This is useful for handling authentication issues
 */
export const forceLogout = (): void => {
  clearAllAuthData();
  window.location.href = '/login';
};
