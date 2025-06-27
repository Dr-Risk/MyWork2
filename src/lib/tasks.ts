
/**
 * @fileoverview Task Data Definitions
 * 
 * @description
 * This file defines the TypeScript type for a `Task` object and provides
 * an initial, default set of tasks for the application. This data is used
 * to populate the dashboard when the application is first run or when
 * local storage is empty.
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
export const initialTasks: Task[] = [
  {
    id: 5,
    title: "Team meeting on new protocols",
    description: "Attend session on updated ER procedures.",
    priority: "Medium",
    dueDate: "Tomorrow",
    status: "Pending",
    assignee: 'moqadri',
    assigneeName: 'Mo Qadri',
  },
  {
    id: 7,
    title: "Follow up with patient",
    description: "Check in on the patient from yesterday's appointment.",
    priority: "Medium",
    dueDate: "Today",
    status: "Pending",
    assignee: 'utaker',
    assigneeName: 'Utaker',
  },
];
