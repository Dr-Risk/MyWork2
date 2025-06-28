
'use client';

import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import type { Task } from "@/lib/tasks";
import { initialTasks } from "@/lib/tasks";

/**
 * @fileoverview Users / My Tasks Page
 * 
 * @description
 * This page serves a dual purpose based on the logged-in user's role:
 * 1. For `contractor` users, it acts as their primary task dashboard, showing only the tasks assigned to them.
 * 2. For `full-time` and `admin` users, it's a "Connect with Friends" page, which is currently a placeholder.
 * 
 * This component demonstrates how a single route can render different content based on user permissions.
 * It also contains its own logic for fetching and persisting task data, specific to the contractor's view.
 */
export default function UsersPage() {
    const { user, isLoading } = useAuth();

    // State management for tasks.
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTasksLoaded, setIsTasksLoaded] = useState(false);

    /**
     * This effect runs once on component mount to load and reconcile task data for the contractor view.
     * It uses the same robust merging logic as the main dashboard to ensure data consistency.
     */
    useEffect(() => {
        try {
          // Use a Map to intelligently merge default tasks with stored tasks.
          // This ensures user changes (like completing a task) are preserved.
          const tasksMap = new Map<number, Task>();
          
          // 1. Add the initial tasks from the codebase first.
          for (const initialTask of initialTasks) {
            tasksMap.set(initialTask.id, initialTask);
          }

          // 2. Load tasks from local storage and overwrite the defaults.
          const storedTasksJSON = localStorage.getItem('appTasks');
          if (storedTasksJSON) {
            const storedTasks = (JSON.parse(storedTasksJSON) as Task[]);
            for (const storedTask of storedTasks) {
              tasksMap.set(storedTask.id, storedTask);
            }
          }
    
          // The final task list is the values from the map.
          const finalTasks = Array.from(tasksMap.values());
          setTasks(finalTasks);
          
        } catch (error) {
          console.error("Failed to load tasks, falling back to initial set.", error);
          // If there's an error, fall back to the raw initial task list.
          setTasks(initialTasks);
        } finally {
          setIsTasksLoaded(true);
        }
    }, []); // Empty dependency array ensures this runs only once on mount.

    /**
     * This effect persists the task list to local storage whenever it changes.
     * The `isTasksLoaded` flag prevents it from saving an empty array before data is loaded.
     */
    useEffect(() => {
        if (isTasksLoaded) {
            localStorage.setItem('appTasks', JSON.stringify(tasks));
        }
    }, [tasks, isTasksLoaded]);

    // Handler for a contractor to mark their own task as complete.
    const handleCompleteTask = (taskId: number) => {
        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, status: "Completed" } : task
        );
        setTasks(updatedTasks);
    };

    // `useMemo` is used for performance to filter and get only the tasks assigned to the current user.
    // It only recalculates when the task list or the user object changes.
    const myTasks = useMemo(() => {
        if (!user) return [];
        return tasks.filter(task => task.assignee === user.username);
    }, [tasks, user]);


    // Return nothing while authentication and task data are still loading to prevent content flicker.
    if (isLoading || !isTasksLoaded) {
        return null;
    }
    
    // If the user is a contractor, render their personalized task dashboard.
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
                    {/* Map over the filtered tasks and render a card for each one. */}
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
                                    disabled={task.status === 'Completed'}
                                >
                                    {task.status === "Completed"
                                        ? "Completed"
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

    // If the user is NOT a contractor, render the placeholder "Connect with Friends" page.
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
