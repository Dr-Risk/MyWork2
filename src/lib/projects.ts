
/**
 * @fileoverview Project and Document Data Definitions and Initial State
 *
 * @description
 * This file defines the core data structures for the application: `Project` and `Document`.
 * It also exports the initial, empty state for both projects and documents. This serves as
 * the starting point for the application's data before any user actions or data persistence
 * from `localStorage` occurs.
 */

/**
 * Defines the structure for a project document.
 * In a real-world application, the `url` would point to a file in a cloud storage
 * service like Firebase Storage or Google Cloud Storage. For this demo, it will store
 * a Data URI containing the full file content.
 */
export interface Document {
  id: number;
  name: string;
  url: string; // This will store the file content as a Base64 Data URI.
  projectId: number;
}

/**
 * Defines the structure for a game development project.
 * The `lead` and `assignedDevelopers` fields store the `username` of the respective users.
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  deadline: string;
  status: "Active" | "Completed";
  lead: string;
  assignedDevelopers: string[];
}

/**
 * The initial list of projects that the application starts with.
 * This is an empty array to ensure a clean slate.
 */
export const initialProjects: Project[] = [];

/**
 * The initial list of documents that the application starts with.
 * This is an empty array to ensure a clean slate.
 */
export const initialDocuments: Document[] = [];

    