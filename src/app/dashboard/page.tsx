
'use client';

import { useEffect, useState, useCallback } from "react";
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
import { PlusCircle, Users, FileText, HardDriveUpload, UserPlus, Gamepad2, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { initialProjects, initialDocuments } from "@/lib/projects";
import type { Project, Document } from "@/lib/projects";
import { AddProjectForm } from "@/components/add-project-form";
import { useToast } from "@/hooks/use-toast";
import { AddUserForm } from "@/components/add-user-form";
import { AssignTeamForm } from "@/components/assign-team-form";
import { getDevelopers, getUsers as getAllUsers, type SanitizedUser } from "@/lib/auth";

/**
 * @fileoverview Main Dashboard Page for PixelForge Nexus
 * @description This is the primary landing page after a user logs in. It displays a list
 * of projects and provides functionality based on the user's role:
 * - Admins: Can add new projects, mark projects as complete, manage users, assign teams and upload documents.
 * - Project Leads: Can assign developers to their projects and upload documents.
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
  const [developers, setDevelopers] = useState<SanitizedUser[]>([]);
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  const [assignTeamProjectId, setAssignTeamProjectId] = useState<number | null>(null);

  /**
   * Loads all necessary data for the dashboard.
   * This function is wrapped in `useCallback` to prevent unnecessary re-renders.
   * It fetches the latest user, developer, project, and document lists.
   */
  const loadData = useCallback(async () => {
    // If the auth state is still loading, we can't proceed.
    if (isLoading) return;

    try {
      // Load projects and documents from either localStorage or the initial state.
      // This logic remains to persist data for a user's session.
      const savedProjects = localStorage.getItem("appProjects");
      const savedDocs = localStorage.getItem("appDocuments");
      setProjects(savedProjects ? JSON.parse(savedProjects) : initialProjects);
      setDocuments(savedDocs ? JSON.parse(savedDocs) : initialDocuments);
      
      // Fetch the latest lists of all users and just developers from the "server".
      // This is the critical part that now runs every time `loadData` is called.
      const allUsers = await getAllUsers();
      const developerUsers = await getDevelopers();
      setUsers(allUsers);
      setDevelopers(developerUsers);

    } catch (error) {
      console.error("Failed to load data, falling back to initial set.", error);
      // Fallback to initial data in case of an error.
      setProjects(initialProjects);
      setDocuments(initialDocuments);
    } finally {
      // Mark data as loaded to render the UI.
      setIsDataLoaded(true);
    }
  }, [isLoading]);

  // Load data when the component mounts or auth state changes.
  useEffect(() => {
    loadData();
  }, [loadData]);


  /**
   * Persists the current state of projects and documents to localStorage.
   * This `useEffect` hook runs whenever the `projects` or `documents` state changes,
   * ensuring that the user's data is saved across browser sessions.
   */
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("appProjects", JSON.stringify(projects));
      localStorage.setItem("appDocuments", JSON.stringify(documents));
    }
  }, [projects, documents, isDataLoaded]);

  /**
   * Handles adding a new project to the state.
   * It creates a new project object with a unique ID and "Active" status,
   * closes the "Add Project" dialog, and shows a success toast.
   */
  const handleAddProject = (newProject: Omit<Project, 'id' | 'status'>) => {
    setProjects(prev => [
      { ...newProject, id: Date.now(), status: "Active" },
      ...prev
    ]);
    setIsAddProjectOpen(false);
    toast({ title: "Project Created", description: `"${newProject.name}" has been added.` });
  };
  
  /**
   * Handles marking a project as "Completed".
   * It finds the project by its ID and updates its status.
   */
  const handleCompleteProject = (projectId: number) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: "Completed" } : p));
    toast({ title: "Project Updated", description: "Project marked as complete." });
  };

  /**
   * Handles assigning developers to a project.
   * It updates the project's `assignedDevelopers` array, ensuring no duplicates,
   * closes the dialog, and shows a success toast.
   */
  const handleAssignTeam = (projectId: number, assignedUsernames: string[]) => {
     setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            // Use a Set to efficiently merge new and existing developers, avoiding duplicates.
            const currentDevs = new Set(p.assignedDevelopers);
            assignedUsernames.forEach(username => currentDevs.add(username));
            return { ...p, assignedDevelopers: Array.from(currentDevs) };
        }
        return p;
    }));
    setAssignTeamProjectId(null); // Close the dialog.
    toast({ title: "Team Updated", description: "Developers have been assigned to the project." });
  };

  /**
   * Handles uploading a file and associating it with a project.
   * In this mock implementation, it creates a new document object without
   * actually uploading the file to a server.
   */
  const handleFileUpload = (projectId: number, file: File) => {
    const newDocument: Document = {
      id: Date.now(),
      name: file.name,
      url: "#", // In a real app, this URL would come from a file storage service.
      projectId,
    };
    setDocuments(prev => [newDocument, ...prev]);
    toast({ title: "File Uploaded", description: `"${file.name}" has been added to the project.` });
  };

  /**
   * Callback function for when a new user is successfully added.
   * This is the critical fix: It triggers `loadData` to refetch the user list
   * from the "server" and closes the "Add User" dialog.
   */
  const handleUserAdded = () => {
    setIsAddUserDialogOpen(false);
    // Refetch the user data to ensure the UI is up-to-date with the new user.
    loadData();
  };

  /**
   * A reusable component to render a single project card.
   * It displays project details and actions based on the current user's role.
   */
  const ProjectCard = ({ project }: { project: Project }) => {
    const projectDocs = documents.filter(d => d.projectId === project.id);
    const assignedDevsList = users.filter(u => project.assignedDevelopers.includes(u.username));
    const projectLead = users.find(u => u.username === project.lead);
    
    /**
     * [SECURITY] Role-Based Access Control (RBAC) Logic
     * This variable determines if the current user has management privileges
     * over this specific project (assigning teams, uploading documents).
     *
     * Rules:
     * - 'admin': Admins have universal management rights over all projects.
     * - 'project-lead': Project Leads can only manage projects where their
     *   `username` matches the project's `lead` field. They cannot manage
     *   projects they are merely assigned to as a developer.
     */
    const canManageProject = user?.role === 'admin' || (user?.role === 'project-lead' && user.username === project.lead);
    
    // Determine if the "Assign Team" button should be shown. Only for Project Leads.
    const canAssignTeam = user?.role === 'project-lead' && user.username === project.lead;

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
        <CardFooter className="grid grid-cols-2 gap-2">
            {/* [PERMISSIONS] "Assign Team" button is only for Project Leads on their projects. */}
            {canAssignTeam && (
                <Dialog open={assignTeamProjectId === project.id} onOpenChange={(isOpen) => setAssignTeamProjectId(isOpen ? project.id : null)}>
                  <DialogTrigger asChild>
                      <Button variant="outline"><UserPlus className="mr-2"/> Assign Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Assign Team to "{project.name}"</DialogTitle>
                          <DialogDescription>Select developers to add to this project.</DialogDescription>
                      </DialogHeader>
                      <AssignTeamForm 
                        // Pass only users with the 'developer' role to the form.
                        developers={developers} 
                        onSubmit={(devs) => handleAssignTeam(project.id, devs)}
                      />
                  </DialogContent>
                </Dialog>
            )}
            
            {/* [PERMISSIONS] "Upload Docs" is for Admins and the designated Project Lead. */}
            {canManageProject && (
                <Button variant="outline" onClick={() => document.getElementById(`file-upload-${project.id}`)?.click()}>
                    <HardDriveUpload className="mr-2"/> Upload Docs
                </Button>
            )}
            <input type="file" id={`file-upload-${project.id}`} className="hidden" onChange={(e) => e.target.files && handleFileUpload(project.id, e.target.files[0])}/>
            
            {/* [PERMISSIONS] The "Mark as Complete" action is strictly admin-only. */}
            {user?.role === 'admin' && project.status === 'Active' && (
                 <Button variant="default" onClick={() => handleCompleteProject(project.id)} className="col-span-2">
                    <CheckCircle2 className="mr-2"/> Mark as Complete
                </Button>
            )}
        </CardFooter>
      </Card>
    );
  };

  /**
   * Filters the list of projects based on the current user's role and assignments.
   */
  const getVisibleProjects = () => {
    if (!user) return [];
    switch (user.role) {
      // Admins see all projects.
      case 'admin':
        return projects;
      // Project Leads see projects they lead OR are assigned to as a developer.
      case 'project-lead':
        return projects.filter(p => p.lead === user.username || p.assignedDevelopers.includes(user.username));
      // Developers only see projects they are assigned to.
      case 'developer':
        return projects.filter(p => p.assignedDevelopers.includes(user.username));
      default:
        return [];
    }
  };

  // While data is loading, show a skeleton UI.
  if (isLoading || !isDataLoaded) {
    return <Skeleton className="h-64 w-full" />;
  }

  const visibleProjects = getVisibleProjects();

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
                          projectLeads={users.filter(u => u.role === 'project-lead')} 
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
            <ProjectCard key={project.id} project={project} />
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
