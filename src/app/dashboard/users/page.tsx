
'use client';

import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

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

const initialContractorTasks: Task[] = [
    {
        id: 1,
        title: "Transcribe Patient Interview Notes",
        description: "Transcribe audio recording from Dr. White's interview with patient Smith.",
        priority: "High",
        dueDate: "Today",
        status: "Pending",
        assignee: "john.doe",
    },
    {
        id: 2,
        title: "Data Entry: Lab Results",
        description: "Enter results from the latest batch of blood tests into the patient portal.",
        priority: "Medium",
        dueDate: "Tomorrow",
        status: "Pending",
        assignee: "john.doe",
    },
    {
        id: 3,
        title: "Verify Insurance Information",
        description: "Check and update insurance details for patients scheduled for next week.",
        priority: "High",
        dueDate: "This Week",
        status: "Pending",
        assignee: "other.contractor", // This task should not be visible to john.doe
    },
     {
        id: 4,
        title: "Update transcription software",
        description: "Install the latest version of the transcription software on the workstation.",
        priority: "Low",
        dueDate: "This Week",
        status: "Completed",
        assignee: "john.doe",
    },
];

export default function UsersPage() {
    const { user, isLoading } = useAuth();
    const [tasks, setTasks] = useState(initialContractorTasks);

    const handleCompleteTask = (taskId: number) => {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === taskId ? { ...task, status: "Completed" } : task
          )
        );
      };

    const myTasks = useMemo(() => {
        if (!user) return [];
        return tasks.filter(task => task.assignee === user.username);
    }, [tasks, user]);


    // The main layout handles the primary loading state.
    // We only need to differentiate between roles here.
    if (isLoading) {
        return null;
    }
    
    if (user?.role === 'contractor') {
        return (
            <>
                <div>
                    <h1 className="text-3xl font-headline font-bold tracking-tight">
                        My Tasks
                    </h1>
                    <p className="text-muted-foreground">
                        Here&apos;s a list of your assigned tasks.
                    </p>
                </div>
                <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {myTasks.length > 0 ? myTasks.map((task) => (
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
                                    onClick={() => task.status !== 'Completed' && handleCompleteTask(task.id)}
                                >
                                    {task.status === "Completed"
                                        ? "View Details"
                                        : "Mark as Complete"}
                                </Button>
                            </CardFooter>
                        </Card>
                    )) : (
                        <p className="text-muted-foreground col-span-full">You have no tasks assigned.</p>
                    )}
                </div>
            </>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
                Connect with Friends
            </h1>
            <p className="text-muted-foreground">
                Find colleagues, add them as friends, and start a conversation.
            </p>
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Users className="w-8 h-8 text-primary"/>
                        <div>
                            <CardTitle>Chat Feature Coming Soon</CardTitle>
                            <CardDescription>The ability to add friends and chat is under development. Stay tuned!</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
