import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Patient Follow-up: John Doe",
    description: "Check on post-op recovery and medication adherence.",
    priority: "High",
    dueDate: "Today",
    status: "Pending",
  },
  {
    id: 2,
    title: "Review Lab Results: Jane Smith",
    description: "Analyze recent blood work and update patient chart.",
    priority: "High",
    dueDate: "Today",
    status: "Pending",
  },
  {
    id: 3,
    title: "Prepare for rounds",
    description: "Compile notes for morning patient rounds.",
    priority: "Medium",
    dueDate: "Tomorrow",
    status: "Pending",
  },
  {
    id: 4,
    title: "Update prescription: Alice Johnson",
    description: "Renew medication for chronic condition.",
    priority: "Low",
    dueDate: "This Week",
    status: "Completed",
  },
  {
    id: 5,
    title: "Team meeting on new protocols",
    description: "Attend session on updated ER procedures.",
    priority: "Medium",
    dueDate: "Tomorrow",
    status: "Pending",
  },
];

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s a list of your tasks for today.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tasks.map((task) => (
          <Card key={task.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-headline">
                  {task.title}
                </CardTitle>
                <Badge
                  variant={
                    task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {task.priority}
                </Badge>
              </div>
              <CardDescription>{task.dueDate}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant={task.status === "Completed" ? "outline" : "default"}
                className="w-full"
              >
                {task.status === "Completed"
                  ? "View Details"
                  : "Mark as Complete"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
