
'use client';

import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import type { Task } from "@/app/dashboard/page";

export default function UsersPage() {
    const { user, isLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTasksLoaded, setIsTasksLoaded] = useState(false);

    useEffect(() => {
        try {
            // Note: This page now reads from 'appTasks', the same central task
            // list used by the main dashboard, to ensure data is unified.
            const storedTasks = localStorage.getItem('appTasks');
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (error) {
            console.error("Failed to load tasks from localStorage", error);
            setTasks([]);
        }
        setIsTasksLoaded(true);
    }, []);

    const handleCompleteTask = (taskId: number) => {
        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, status: "Completed" } : task
        );
        setTasks(updatedTasks);
        // Persist the change to the unified task list in localStorage
        localStorage.setItem('appTasks', JSON.stringify(updatedTasks));
    };

    const myTasks = useMemo(() => {
        if (!user) return [];
        return tasks.filter(task => task.assignee === user.username);
    }, [tasks, user]);


    // The main layout handles the primary loading state.
    // We only need to differentiate between roles here.
    if (isLoading || !isTasksLoaded) {
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
