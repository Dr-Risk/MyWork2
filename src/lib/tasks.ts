
/**
 * @fileoverview DEPRECATED - Task Data Definitions
 * 
 * @description
 * This file is deprecated and will be removed. Project data is now managed in `src/lib/projects.ts`.
 */

// Defines the shape of a single task object.
export type Task = {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "Pending" | "Completed";
  assignee?: string; // The username of the person the task is assigned to.
  assigneeName?: string; // The full name of the assignee.
};

// The initial list of tasks that the application starts with.
export const initialTasks: Task[] = [];
