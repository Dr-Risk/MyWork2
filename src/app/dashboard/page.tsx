
'use client';

import { useEffect } from "react";
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
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
