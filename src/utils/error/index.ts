

// Import existing general error handling
export * from '../error';

// Import HomeScreen-specific error handling
export * from './homeScreen';

// Import ApplicationLeave-specific error handling
export * from './applicationLeave';

// Re-export for convenience
export { homeScreenErrorHandler as HomeScreenErrors } from './homeScreen';
export { ApplicationLeaveErrorHandler as ApplicationLeaveErrors } from './applicationLeave';