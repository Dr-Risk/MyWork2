
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

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoaded, setIsTasksLoaded] = useState(false);
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const isPrivilegedUser = user?.role === 'admin' || !!user?.isSuperUser;
  
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch users first if privileged
        let userList: SanitizedUser[] = [];
        if (isPrivilegedUser) {
          userList = await getUsers();
          setUsers(userList);
        }
        const existingUsernames = new Set(userList.map(u => u.username));

        // Load and reconcile tasks
        const storedTasksJSON = localStorage.getItem('appTasks');
        const storedTasks = storedTasksJSON ? (JSON.parse(storedTasksJSON) as Task[]) : [];
        
        const tasksMap = new Map<number, Task>();
        
        for (const task of storedTasks) {
          tasksMap.set(task.id, task);
        }
        
        for (const initialTask of initialTasks) {
          tasksMap.set(initialTask.id, initialTask);
        }

        let finalTasks = Array.from(tasksMap.values());

        // For privileged users, filter out tasks assigned to non-existent users
        if (isPrivilegedUser) {
          finalTasks = finalTasks.filter(task => !task.assignee || existingUsernames.has(task.assignee));
        }
        
        setTasks(finalTasks);
      } catch (error) {
        console.error("Failed to load data, falling back to initial set.", error);
        setTasks(initialTasks);
      } finally {
        setIsTasksLoaded(true);
      }
    }

    if (!isLoading) {
      loadData();
    }
  }, [isPrivilegedUser, isLoading]);

  useEffect(() => {
    // This effect saves the tasks to localStorage whenever they change.
    // The isTasksLoaded flag prevents saving an empty initial array before loading.
    if (isTasksLoaded) {
      localStorage.setItem('appTasks', JSON.stringify(tasks));
    }
  }, [tasks, isTasksLoaded]);

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
  
  const handleDeleteTask = (taskId: number) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "The task has been successfully removed.",
    });
  };

  useEffect(() => {
    if (!isLoading && user?.role === 'contractor') {
      router.replace('/dashboard/users');
    }
  }, [user, isLoading, router]);
  
  const groupedTasks = useMemo(() => {
    if (!isPrivilegedUser) return {};
    return tasks.reduce((acc, task) => {
      const assigneeName = task.assigneeName || 'Unassigned';
      if (!acc[assigneeName]) {
        acc[assigneeName] = [];
      }
      acc[assigneeName].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, isPrivilegedUser]);

  const myTasks = useMemo(() => {
    if (isPrivilegedUser || !user) return [];
    return tasks.filter(task => task.assignee === user.username);
  }, [tasks, user, isPrivilegedUser]);

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

  if (user?.role === 'contractor') {
      return null;
  }

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
          {isPrivilegedUser && task.assigneeName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserCircle className="h-4 w-4" />
              <span>Assigned to {task.assigneeName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
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
          >
            {task.status === "Completed"
              ? "View Details"
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

      {isPrivilegedUser ? (
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
