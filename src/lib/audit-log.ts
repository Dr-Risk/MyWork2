
'use server';

/**
 * @fileoverview Mock Audit Logging Service for PixelForge Nexus
 *
 * @description
 * This file simulates a backend service for recording and retrieving audit logs.
 * In a production environment, this would write to a dedicated, secure logging
 * database or a service like Cloud Logging. For this demo, it persists logs
 * to a simple JSON file.
 */

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

// Path to the mock database file for logs
const logDbPath = path.join(process.cwd(), 'src', 'lib', 'audit-log.json');

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  username: string; // The user who performed the action. 'System' for automated actions.
  action: string; // e.g., 'LOGIN', 'CREATE_USER', 'DELETE_PROJECT'
  details: string; // A human-readable description of the event.
}

let logsCache: AuditLogEntry[] | null = null;

/**
 * Reads all logs from the audit-log.json file.
 * @returns A promise that resolves to an array of log entries.
 */
const readLogs = async (): Promise<AuditLogEntry[]> => {
  if (logsCache) {
    return logsCache;
  }
  
  try {
    if (!fs.existsSync(logDbPath)) {
        await fs.promises.writeFile(logDbPath, '[]', 'utf-8');
    }
    const data = await fs.promises.readFile(logDbPath, 'utf-8');
    logsCache = JSON.parse(data);
    return logsCache!;
  } catch (error) {
    logger.error('Error reading or parsing audit-log.json.', error);
    return []; // Return empty array on error
  }
};

/**
 * Writes the logs array to the audit-log.json file.
 * @param logs The array of log entries to write.
 */
const writeLogs = async (logs: AuditLogEntry[]): Promise<void> => {
  try {
    await fs.promises.writeFile(logDbPath, JSON.stringify(logs, null, 2));
    logsCache = logs; // Update cache
  } catch (error) {
    logger.error('Error writing logs to file.', error);
  }
};

/**
 * Adds a new entry to the audit log.
 * @param username The user performing the action.
 * @param action The type of action.
 * @param details A description of the action.
 */
export const addAuditLog = async (username: string, action: string, details: string): Promise<void> => {
    const logs = await readLogs();
    const newLogEntry: AuditLogEntry = {
        id: Date.now(), // Simple unique ID for this demo
        timestamp: new Date().toISOString(),
        username,
        action,
        details,
    };
    
    logs.push(newLogEntry);
    await writeLogs(logs);
    logger.info(`Audit Log: [User: ${username}] [Action: ${action}] ${details}`);
};


/**
 * Retrieves all audit logs.
 * @returns A promise that resolves to an array of all audit log entries.
 */
export const getAuditLogs = async (): Promise<AuditLogEntry[]> => {
    return await readLogs();
};
