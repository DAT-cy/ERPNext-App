// src/utils/error/index.ts
// Main error utils entry point

// Import existing general error handling
export * from '../error';

// Import HomeScreen-specific error handling
export * from './homeScreen';

// Re-export for convenience
export { homeScreenErrorHandler as HomeScreenErrors } from './homeScreen';