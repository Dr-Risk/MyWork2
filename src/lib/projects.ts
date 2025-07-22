
'use server';

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
export const initialProjects: Project[] = [
  {
    id: 1,
    name: "Project Chimera",
    description: "A next-gen open-world RPG with dynamic storytelling.",
    deadline: "2025-12-31",
    status: "Active",
    lead: 'jane_lead',
    assignedDevelopers: ['dev_squad'],
  },
  {
    id: 2,
    name: "Pixel Racers",
    description: "A retro-style arcade racing game for mobile platforms.",
    deadline: "2024-10-15",
    status: "Active",
    lead: 'jane_lead',
    assignedDevelopers: [],
  },
  {
    id: 3,
    name: "Project Nebula",
    description: "A 4X space strategy game.",
    deadline: "2024-08-01",
    status: "Completed",
    lead: 'moqadri',
    assignedDevelopers: ['dev_squad'],
  },
];

export const initialDocuments: Document[] = [
  { id: 1, projectId: 1, name: "Game Design Document (GDD)", url: "#" },
  { id: 2, projectId: 1, name: "Character Concept Art", url: "#" },
  { id: 3, projectId: 2, name: "Technical Design Doc", url: "#" },
];
