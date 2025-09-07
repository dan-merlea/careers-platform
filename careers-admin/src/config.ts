// API configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Environment detection
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Other global configuration values can be added here
export const APP_NAME = 'Careers Admin';
