
export type Task = {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "Pending" | "Completed";
  assignee?: string;
  assigneeName?: string;
};

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
    id: 6,
    title: "Order new lab supplies",
    description: "Inventory check and order placement for the main lab.",
    priority: "Medium",
    dueDate: "This Week",
    status: "Pending",
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
