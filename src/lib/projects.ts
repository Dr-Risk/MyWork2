
/**
 * @fileoverview Project and Document Data Definitions
 * 
 * @description
 * This file defines the TypeScript types for Projects and Documents, and provides
 * an initial, default set of data for the application. This data is used
 * to populate the dashboard.
 */

export interface Document {
  id: number;
  name: string;
  url: string; // In a real app, this would point to a file in cloud storage.
  projectId: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  deadline: string;
  status: "Active" | "Completed";
  lead: string; // username of the project lead
  assignedDevelopers: string[]; // array of usernames
}

// The initial list of projects that the application starts with.
export const initialProjects: Project[] = [];

export const initialDocuments: Document[] = [];
