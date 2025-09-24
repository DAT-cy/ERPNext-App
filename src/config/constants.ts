// App constants
export const APP_CONFIG = {
  NAME: 'ERPNext RN Base',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.erpnext.rnbase',
} as const;

export const STORAGE_KEYS = {
  SID: 'erpnext_sid',
  USER_DATA: 'user_data',
  THEME: 'theme_preference',
} as const;

export const API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
} as const;

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_USERNAME_LENGTH: 50,
} as const;
