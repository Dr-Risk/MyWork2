/**
 * @fileoverview Centralized Logging Service for PixelForge Nexus
 *
 * @description
 * This module provides a simple, centralized logging utility for the application.
 * Using this service instead of direct `console.log` calls offers several advantages:
 * 1.  **Standardized Format**: All logs are prefixed with a timestamp and a log level
 *     (e.g., INFO, WARN, ERROR), making them easier to read and filter.
 * 2.  **Centralized Control**: If we ever want to switch to a cloud-based logging
 *     service (like Datadog, Sentry, or Splunk), we only need to modify this file.
 * 3.  **Maintainability**: It keeps the business logic in other files (like auth.ts)
 *     cleaner and focused on their primary responsibilities.
 */

// Defines the available log levels.
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

/**
 * A generic logging function that formats and prints messages to the console.
 * @param level The level of the log (e.g., INFO, WARN).
 * @param message The primary message to be logged.
 * @param details Any additional data or objects to include in the log.
 */
const log = (level: string, message: string, details?: unknown) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  if (details) {
    console.log(logMessage, details);
  } else {
    console.log(logMessage);
  }
};

// The logger object that will be exported and used throughout the application.
export const logger = {
  /**
   * For general informational messages about application state.
   * @example logger.info('User logged in successfully.');
   */
  info: (message: string, details?: unknown) => log(LOG_LEVELS.INFO, message, details),

  /**
   * For non-critical issues or potential problems that don't stop the application.
   * @example logger.warn('API response took longer than expected.');
   */
  warn: (message: string, details?: unknown) => log(LOG_LEVELS.WARN, message, details),

  /**
   * For critical errors that prevent a function from completing.
   * @example logger.error('Failed to connect to the database.', error);
   */
  error: (message: string, details?: unknown) => log(LOG_LEVELS.ERROR, message, details),
};
