
/**
 * @fileoverview DEPRECATED - Task Data Definitions
 * 
 * @description
 * This file is deprecated and will be removed in a future cleanup.
 * Project and task-related data is now defined and managed in `src/lib/projects.ts`.
 * This file is kept temporarily to avoid breaking any legacy import paths during transition.
 */

/**
 * Defines the shape of a single task object.
 * @deprecated Use the `Project` interface in `src/lib/projects.ts` instead.
 */
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

/**
 * The initial list of tasks that the application starts with.
 * @deprecated This is no longer used.
 */
export const initialTasks: Task[] = [];
