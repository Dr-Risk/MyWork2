
'use client';

import { useEffect, useState } from "react";
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
import { FileText, CheckCircle2, Gamepad2, Users, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { initialProjects, initialDocuments } from "@/lib/projects";
import type { Project, Document } from "@/lib/projects";
import { useToast } from "@/hooks/use-toast";
import { getUsers as getAllUsers, type SanitizedUser } from "@/lib/auth";
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

/**
 * @fileoverview All Projects Page for Administrators
 * @description This page displays a comprehensive list of all projects in the system,
 * regardless of their status or team assignment. It is intended for administrators only
 * and includes actions like marking projects as complete or deleting them.
 */
export default function AllProjectsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State management for projects, documents, users, and loading status.
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  /**
   * [SECURITY] Route Protection.
   * This `useEffect` hook ensures that only users with the 'admin' role can access this page.
   * If a non-admin user tries to navigate here, they will be redirected to the main dashboard.
   */
  useEffect(() => {
    if (!isAuthLoading && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isAuthLoading, router]);
  
  /**
   * Loads all necessary data from the mock backend.
   * It clears any existing data from localStorage to ensure the view is fresh
   * and then fetches all projects, documents, and users.
   */
  useEffect(() => {
    async function loadData() {
        if (isAuthLoading) return;
        try {
            // Always start with a clean slate by clearing localStorage.
            localStorage.removeItem("appProjects");
            localStorage.removeItem("appDocuments");
            
            // Set data from the initial in-memory source.
            setProjects(initialProjects);
            setDocuments(initialDocuments);
            
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to load data, falling back to initial set.", error);
            setProjects(initialProjects);
            setDocuments(initialDocuments);
        } finally {
            setIsDataLoaded(true);
        }
    }
    loadData();
  }, [isAuthLoading]);

  /**
   * Persists project data to localStorage whenever it changes.
   * This ensures that any modifications (like completing or deleting a project)
   * are saved for the user's session.
   */
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("appProjects", JSON.stringify(projects));
    }
  }, [projects, isDataLoaded]);

  /**
   * Handles marking a project as "Completed".
   */
  const handleCompleteProject = (projectId: number) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: "Completed" } : p));
    toast({ title: "Project Updated", description: "Project marked as complete." });
  };

  /**
   * Handles permanently deleting a project.
   */
  const handleDeleteProject = (projectId: number) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({ variant: "destructive", title: "Project Deleted", description: "The project has been permanently removed." });
  };
  
  /**
   * A reusable component to render a single project card with admin-specific actions.
   */
  const ProjectCard = ({ project }: { project: Project }) => {
    const projectDocs = documents.filter(d => d.projectId === project.id);
    const assignedDevsList = users.filter(u => project.assignedDevelopers.includes(u.username));
    const projectLead = users.find(u => u.username === project.lead);

    return (
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl">{project.name}</CardTitle>
            <Badge variant={project.status === "Active" ? "secondary" : "success"}>
              {project.status}
            </Badge>
          </div>
          <CardDescription>Deadline: {project.deadline}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div>
            <h4 className="font-semibold text-sm mb-2">Project Lead</h4>
            <p className="text-sm text-muted-foreground">{projectLead?.name || project.lead}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Assigned Team ({assignedDevsList.length})</h4>
            <div className="flex flex-wrap gap-2">
              {assignedDevsList.length > 0 ? (
                assignedDevsList.map(dev => <Badge key={dev.username} variant="outline">{dev.name}</Badge>)
              ) : (
                <p className="text-xs text-muted-foreground">No developers assigned.</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Documents ({projectDocs.length})</h4>
            {projectDocs.length > 0 ? (
                <ul className="space-y-1">
                    {projectDocs.map(doc => (
                        <li key={doc.id} className="text-sm flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <a href={doc.url} className="hover:underline">{doc.name}</a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground">No documents uploaded.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
            {/* Show "Mark as Complete" button for active projects. */}
            {user?.role === 'admin' && project.status === 'Active' && (
                 <Button variant="default" onClick={() => handleCompleteProject(project.id)} className="w-full">
                    <CheckCircle2 className="mr-2"/> Mark as Complete
                </Button>
            )}
            {/* Show "Delete Project" button for completed projects. */}
             {user?.role === 'admin' && project.status === 'Completed' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2"/> Delete Project
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project "{project.name}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                            Yes, delete project
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </CardFooter>
      </Card>
    );
  };

  // Show a skeleton loader while authentication is in progress or if the user is not an admin.
  if (isAuthLoading || !isDataLoaded || user?.role !== 'admin') {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            All Projects
          </h1>
          <p className="text-muted-foreground">
            A complete list of every project in the system.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          // Display a message if no projects exist in the system.
          <Card className="col-span-full flex flex-col items-center justify-center p-12">
            <Gamepad2 className="w-16 h-16 text-muted-foreground mb-4" />
            <CardTitle className="font-headline">No Projects Found</CardTitle>
            <CardDescription>Get started by adding a new project on the dashboard.</CardDescription>
          </Card>
        )}
      </div>
    </>
  );
}
