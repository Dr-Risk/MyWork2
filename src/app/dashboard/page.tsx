
'use client';

import { useEffect, useState, useMemo } from "react";
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
import { PlusCircle, UserCircle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddTaskForm } from "@/components/add-task-form";
import { getUsers, type SanitizedUser } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/lib/tasks";
import { initialTasks } from "@/lib/tasks";

/**
 * @fileoverview Main Dashboard Page
 * 
 * @description
 * This is the primary landing page after a user logs in. It displays a list of tasks.
 * The view is dynamic based on the user's role:
 * - Admins and full-time employees see all tasks, grouped by assignee. They can also add and delete tasks.
 * - Contractors see only the tasks assigned to them and can mark them as complete.
 * 
 * The component handles fetching user and task data, reconciling it with local storage for persistence,
 * and managing the state for adding, completing, and deleting tasks.
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // State management for tasks, users, and UI elements.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoaded, setIsTasksLoaded] = useState(false);
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  // A derived boolean to easily check if the user has administrative privileges.
  const isPrivilegedUser = user?.role === 'admin' || !!user?.isSuperUser;
  
  // This effect runs once on component mount to load and reconcile all necessary data.
  useEffect(() => {
    async function loadData() {
      if (isLoading) return;

      try {
        // Fetch the list of all current users from the mock backend.
        const userList = await getUsers();
        setUsers(userList);
        const existingUsernames = new Set(userList.map(u => u.username));

        // Use a Map to intelligently merge default tasks with stored tasks.
        // This ensures user changes (like completing a task) are preserved,
        // while also making sure the app's default tasks are always present.
        const tasksMap = new Map<number, Task>();

        // 1. Add the initial tasks from the codebase first. This establishes the base set.
        for (const initialTask of initialTasks) {
          tasksMap.set(initialTask.id, initialTask);
        }

        // 2. Attempt to load tasks from local storage.
        const storedTasksJSON = localStorage.getItem('appTasks');
        if (storedTasksJSON) {
          const storedTasks = JSON.parse(storedTasksJSON) as Task[];
          // 3. Overwrite the initial tasks with any stored versions.
          // This preserves changes like a task being marked "Completed".
          for (const storedTask of storedTasks) {
            tasksMap.set(storedTask.id, storedTask);
          }
        }
        
        // Convert the map back to an array.
        let reconciledTasks = Array.from(tasksMap.values());
        
        // Final cleanup: Filter out any tasks that are assigned to non-existent users.
        // This prevents data from deleted users from appearing on the dashboard.
        const finalTasks = reconciledTasks.filter(task => {
          return task.assignee && existingUsernames.has(task.assignee);
        });
        
        setTasks(finalTasks);
      } catch (error) {
        console.error("Failed to load data, falling back to initial set.", error);
        // If there's an error (e.g., corrupted local storage), fall back to the default tasks.
        setTasks(initialTasks.filter(task => !!task.assignee));
      } finally {
        // Mark data as loaded to hide the skeleton loaders.
        setIsTasksLoaded(true);
      }
    }

    loadData();
  }, [isLoading]);

  // This effect saves the current task list to local storage whenever it changes.
  // The `isTasksLoaded` flag prevents saving an empty initial array before data has been loaded.
  useEffect(() => {
    if (isTasksLoaded) {
      localStorage.setItem('appTasks', JSON.stringify(tasks));
    }
  }, [tasks, isTasksLoaded]);

  // Handler to mark a task as "Completed".
  const handleCompleteTask = (taskId: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: "Completed" } : task
      )
    );
  };
  
  // Handler to add a new task to the list.
  const handleAddTask = (newTask: Task) => {
    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setIsFormOpen(false); // Close the dialog after adding.
  };
  
  // Handler to delete a task.
  const handleDeleteTask = (taskId: number) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "The task has been successfully removed.",
    });
  };

  // Redirects contractors away from this page to their specific task view.
  useEffect(() => {
    if (!isLoading && user?.role === 'contractor') {
      router.replace('/dashboard/users');
    }
  }, [user, isLoading, router]);
  
  // `useMemo` is used for performance optimization. It groups tasks by assignee
  // and only recalculates when the task list or user privileges change.
  const groupedTasks = useMemo(() => {
    if (!isPrivilegedUser) return {};
    return tasks.reduce((acc, task) => {
      // Find the assignee name from the users list, as the task object might not have it
      // if it was just created.
      const assignee = users.find(u => u.username === task.assignee);
      const assigneeName = assignee?.name || "Unassigned";

      if (!acc[assigneeName]) {
        acc[assigneeName] = [];
      }
      acc[assigneeName].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, users, isPrivilegedUser]);

  // `useMemo` to filter and get only the tasks assigned to the current non-privileged user.
  const myTasks = useMemo(() => {
    if (isPrivilegedUser || !user) return [];
    return tasks.filter(task => task.assignee === user.username);
  }, [tasks, user, isPrivilegedUser]);

  // Show skeleton loaders while waiting for auth and task data.
  if (isLoading || !isTasksLoaded) {
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

  // Prevent rendering the page for contractors before the redirect happens.
  if (user?.role === 'contractor') {
      return null;
  }

  // A reusable component for rendering a single task card.
  const TaskCard = ({ task }: { task: Task }) => (
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
          {/* Show the assignee only for privileged users. */}
          {isPrivilegedUser && task.assigneeName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserCircle className="h-4 w-4" />
              <span>Assigned to {task.assigneeName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
      {/* Show delete button for privileged users, and complete button for others. */}
      {isPrivilegedUser ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Task
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task "{task.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                Yes, delete task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
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
      )}
      </CardFooter>
    </Card>
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            {isPrivilegedUser 
                ? "Manage all tasks for your team."
                : "Here's a list of your assigned tasks."}
          </p>
        </div>
        {/* The "Add Task" button and dialog are only shown to privileged users. */}
        {isPrivilegedUser && (
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

      {/* Conditionally render the task list based on user role. */}
      {isPrivilegedUser ? (
        // For privileged users, render tasks grouped by assignee.
        <div className="space-y-8 mt-6">
          {Object.entries(groupedTasks).sort(([a], [b]) => a.localeCompare(b)).map(([assignee, userTasks]) => (
            <div key={assignee}>
              <h2 className="text-2xl font-headline font-bold tracking-tight">{assignee}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
                {userTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // For regular users, render a simple grid of their own tasks.
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
          {myTasks.length > 0 ? (
            myTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full">You have no tasks assigned.</p>
          )}
        </div>
      )}
    </>
  );
}
