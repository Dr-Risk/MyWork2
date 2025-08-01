
'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Gamepad2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { initialProjects, initialDocuments } from "@/lib/projects";
import type { Project, Document } from "@/lib/projects";
import { AddProjectForm } from "@/components/add-project-form";
import { useToast } from "@/hooks/use-toast";
import { AddUserForm } from "@/components/add-user-form";
import { getUsers as getAllUsers, type SanitizedUser, getDevelopers } from "@/lib/auth";
import { ProjectCard } from "@/components/project-card";

/**
 * @fileoverview Main Dashboard Page for PixelForge Nexus
 * @description This is the primary landing page after a user logs in. It displays a list
 * of projects and provides functionality based on the user's role:
 * - Admins: Can add new projects, mark projects as complete, manage users, assign teams and upload/delete documents.
 * - Project Leads: Can assign developers to their projects and upload/delete documents.
 * - Developers: See a list of projects they are assigned to.
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // State for managing projects, documents, users, and UI dialogs.
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  /**
   * Loads all necessary data for the dashboard.
   * This function is now fully asynchronous to prevent race conditions.
   */
  const loadData = useCallback(async () => {
    try {
      // Load projects and documents from either localStorage or the initial state.
      const savedProjects = localStorage.getItem("appProjects");
      setProjects(savedProjects ? JSON.parse(savedProjects) : initialProjects);
      
      const savedDocs = localStorage.getItem("appDocuments");
      setDocuments(savedDocs ? JSON.parse(savedDocs) : initialDocuments);
      
      // Fetch the latest lists of all users and just developers from the "server".
      const allUsers = await getAllUsers();
      setUsers(allUsers);

    } catch (error) {
      console.error("Failed to load data, falling back to initial set.", error);
      // Fallback to initial data in case of an error.
      setProjects(initialProjects);
      setDocuments(initialDocuments);
    } finally {
      // Mark data as loaded only after all asynchronous operations are complete.
      setIsDataLoaded(true);
    }
  }, []);

  // Load data when the component mounts or auth state changes.
  useEffect(() => {
    // This effect ensures that data is loaded once the user's authentication
    // status is confirmed, preventing race conditions.
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  /**
   * Handles adding a new project to the state.
   * It creates a new project object with a unique ID and "Active" status,
   * closes the "Add Project" dialog, and shows a success toast.
   */
  const handleAddProject = (newProject: Omit<Project, 'id' | 'status'>) => {
    const updatedProjects = [
      { ...newProject, id: Date.now(), status: "Active" as const },
      ...projects
    ];
    setProjects(updatedProjects);
    localStorage.setItem("appProjects", JSON.stringify(updatedProjects));
    setIsAddProjectOpen(false);
    toast({ title: "Project Created", description: `"${newProject.name}" has been added.` });
  };
  
  /**
   * Handles marking a project as "Completed".
   * It finds the project by its ID and updates its status.
   */
  const handleCompleteProject = (projectId: number) => {
    const updatedProjects = projects.map(p => p.id === projectId ? { ...p, status: "Completed" as const } : p);
    setProjects(updatedProjects);
    localStorage.setItem("appProjects", JSON.stringify(updatedProjects));
    toast({ title: "Project Updated", description: "Project marked as complete." });
  };

  /**
   * Handles assigning developers to a project.
   * This function now REPLACES the existing developer list with the new one.
   */
  const handleAssignTeam = (projectId: number, assignedUsernames: string[]) => {
     const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            // Replace the old list of developers with the newly submitted list.
            return { ...p, assignedDevelopers: assignedUsernames };
        }
        return p;
    });
    setProjects(updatedProjects);
    localStorage.setItem("appProjects", JSON.stringify(updatedProjects));
    toast({ title: "Team Updated", description: "The project team has been updated." });
  };
  
  /**
   * Handles updating the project lead for a specific project.
   */
  const handleUpdateProjectLead = (projectId: number, newLeadUsername: string) => {
    const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            return { ...p, lead: newLeadUsername };
        }
        return p;
    });
    setProjects(updatedProjects);
    localStorage.setItem("appProjects", JSON.stringify(updatedProjects));
    toast({ title: "Project Lead Updated", description: "The project lead has been changed." });
  };

  /**
   * Reads a file as a Data URI and adds it to the documents state.
   * This ensures the file content is stored and persists in localStorage.
   */
  const handleFileUpload = (projectId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newDocument: Document = {
          id: Date.now(),
          name: file.name,
          url: event.target.result as string, // Store the file content as a Data URI
          projectId,
        };
        const updatedDocuments = [newDocument, ...documents];
        setDocuments(updatedDocuments);
        localStorage.setItem("appDocuments", JSON.stringify(updatedDocuments));
        toast({ title: "File Uploaded", description: `"${file.name}" has been added to the project.` });
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handles permanently deleting a document after user confirmation.
   * [PERMISSIONS] This action is restricted to Admins and Project Leads.
   */
  const handleDeleteDocument = (documentId: number) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    localStorage.setItem("appDocuments", JSON.stringify(updatedDocuments));
    toast({
        variant: "destructive",
        title: "Document Deleted",
        description: "The document has been permanently removed.",
    });
  };
  
  /**
   * Callback function for when a new user is successfully added.
   * This triggers `loadData` to refetch the user list from the "server"
   * and closes the "Add User" dialog.
   */
  const handleUserAdded = () => {
    setIsAddUserDialogOpen(false);
    // Refetch the user data to ensure the UI is up-to-date with the new user.
    loadData();
  };


  /**
   * [PERFORMANCE] Filters the list of projects based on the current user's role and assignments.
   * useMemo caches the result, so this expensive filtering logic only re-runs when
   * the `user` or `projects` array actually changes, not on every render.
   */
  const visibleProjects = useMemo(() => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return projects;
      case 'project-lead':
        return projects.filter(p => p.lead === user.username || p.assignedDevelopers.includes(user.username));
      case 'developer':
        return projects.filter(p => p.assignedDevelopers.includes(user.username));
      default:
        return [];
    }
  }, [user, projects]);

  /**
   * [PERFORMANCE] Memoizes the lists of project leads and developers.
   * This prevents re-filtering the entire `users` array on every render.
   */
  const { projectLeads, developers } = useMemo(() => {
    const leads = users.filter(u => u.role === 'project-lead');
    const devs = users.filter(u => u.role === 'developer');
    return { projectLeads: leads, developers: devs };
  }, [users]);

  // While data is loading, show a skeleton UI.
  if (isLoading || !isDataLoaded) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Project Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, {user?.name}. Here are the projects you have access to.
          </p>
        </div>
        {/* [PERMISSIONS] Admin-only controls for adding users and projects. */}
        {user?.role === 'admin' && (
            <div className="flex gap-2">
                 <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary"><Users className="mr-2"/> Manage Users</Button>
                    </DialogTrigger>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>Create an account for a new Project Lead or Developer.</DialogDescription>
                        </DialogHeader>
                        {/* We pass a `key` to the form to force it to re-mount with a clean state after a successful submission. */}
                        <AddUserForm onSuccess={handleUserAdded} />
                    </DialogContent>
                 </Dialog>
                 <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2"/> Add Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a new project</DialogTitle>
                            <DialogDescription>Fill in the details for the new game project.</DialogDescription>
                        </DialogHeader>
                        <AddProjectForm 
                          // Pass users with 'project-lead' role to the form.
                          projectLeads={projectLeads} 
                          onSubmit={handleAddProject} 
                        />
                    </DialogContent>
                 </Dialog>
            </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-6">
        {visibleProjects.length > 0 ? (
          visibleProjects.map((project) => (
            <ProjectCard
                key={project.id}
                project={project}
                documents={documents.filter(d => d.projectId === project.id)}
                users={users}
                developers={developers}
                projectLeads={projectLeads}
                currentUser={user!}
                onCompleteProject={handleCompleteProject}
                onAssignTeam={handleAssignTeam}
                onUpdateProjectLead={handleUpdateProjectLead}
                onFileUpload={handleFileUpload}
                onDeleteDocument={handleDeleteDocument}
            />
          ))
        ) : (
          // Display a message when there are no projects to show.
          <Card className="col-span-full flex flex-col items-center justify-center p-12">
            <Gamepad2 className="w-16 h-16 text-muted-foreground mb-4" />
            <CardTitle className="font-headline">No Projects Found</CardTitle>
            <CardDescription>You are not currently assigned to any projects.</CardDescription>
          </Card>
        )}
      </div>
    </>
  );
}
