
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
    id: 1,
    title: "Patient Follow-up: John Doe",
    description: "Check on post-op recovery and medication adherence.",
    priority: "High",
    dueDate: "Today",
    status: "Pending",
    assignee: "casey.white",
    assigneeName: "Dr. Casey White",
  },
  {
    id: 2,
    title: "Review Lab Results: Jane Smith",
    description: "Analyze recent blood work and update patient chart.",
    priority: "High",
    dueDate: "Today",
    status: "Pending",
    assignee: "casey.white",
    assigneeName: "Dr. Casey White",
  },
  {
    id: 3,
    title: "Prepare for rounds",
    description: "Compile notes for morning patient rounds.",
    priority: "Medium",
    dueDate: "Tomorrow",
    status: "Pending",
    assignee: "casey.white",
    assigneeName: "Dr. Casey White",
  },
  {
    id: 4,
    title: "Update prescription: Alice Johnson",
    description: "Renew medication for chronic condition.",
    priority: "Low",
    dueDate: "This Week",
    status: "Completed",
    assignee: "casey.white",
    assigneeName: "Dr. Casey White",
  },
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
