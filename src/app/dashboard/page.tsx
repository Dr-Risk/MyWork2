
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
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
import { PlusCircle, UserCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddTaskForm } from "@/components/add-task-form";
import { getUsers, type SanitizedUser } from "@/lib/auth";

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

const initialTasks: Task[] = [
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
  },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      if (user?.role === 'admin') {
        const userList = await getUsers();
        setUsers(userList);
      }
    }
    fetchUsers();
  }, [user]);

  const handleCompleteTask = (taskId: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: "Completed" } : task
      )
    );
  };
  
  const handleAddTask = (newTask: Task) => {
    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setIsFormOpen(false); // Close the dialog
  };

  useEffect(() => {
    if (!isLoading && user?.role === 'contractor') {
      router.replace('/dashboard/users');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role === 'contractor') {
    return (
      <>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </>
    );
  }

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
        {user?.role === 'admin' && (
           <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Create a new task</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to assign a new task to a team member.
                    </DialogDescription>
                </DialogHeader>
                <AddTaskForm users={users} onSuccess={handleAddTask} />
            </DialogContent>
          </Dialog>
        )}
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
            <CardContent className="flex-grow space-y-3">
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
               {task.assigneeName && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UserCircle className="h-4 w-4" />
                    <span>Assigned to {task.assigneeName}</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
            {user?.role !== 'admin' && (
               <Button
                variant={task.status === "Completed" ? "outline" : "default"}
                className="w-full"
                onClick={() => task.status !== 'Completed' && handleCompleteTask(task.id)}
              >
                {task.status === "Completed"
                  ? "View Details"
                  : "Mark as Complete"}
              </Button>
            )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
