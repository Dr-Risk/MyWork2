
'use client';

import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Users, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const contractorTasks = [
    {
        id: 1,
        title: "Transcribe Patient Interview Notes",
        description: "Transcribe audio recording from Dr. White's interview with patient Smith.",
        priority: "High",
        dueDate: "Today",
        status: "Pending",
    },
    {
        id: 2,
        title: "Data Entry: Lab Results",
        description: "Enter results from the latest batch of blood tests into the patient portal.",
        priority: "Medium",
        dueDate: "Tomorrow",
        status: "Pending",
    },
    {
        id: 3,
        title: "Verify Insurance Information",
        description: "Check and update insurance details for patients scheduled this week.",
        priority: "Low",
        dueDate: "This Week",
        status: "Completed",
    },
];

export default function UsersPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-72" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                  {[...Array(3)].map((_, i) => (
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
            </div>
        );
    }
    
    if (user?.role === 'contractor') {
        return (
            <>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-headline font-bold tracking-tight">
                            My Tasks
                        </h1>
                        <p className="text-muted-foreground">
                            Here&apos;s a list of your assigned tasks.
                        </p>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
                    </Button>
                </div>
                <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {contractorTasks.map((task) => (
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
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">
                Other Users
            </h1>
            <p className="text-muted-foreground">
                Connect with colleagues and other healthcare professionals.
            </p>
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Users className="w-8 h-8 text-primary"/>
                        <div>
                            <CardTitle>Content Under Development</CardTitle>
                            <CardDescription>This section is coming soon. Stay tuned for updates on user profiles!</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
