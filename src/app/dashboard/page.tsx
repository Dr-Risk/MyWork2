
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
import { Button, buttonVariants } from "@/components/ui/button";
import { PlusCircle, Users, FileText, HardDriveUpload, UserPlus, Gamepad2, CheckCircle2, Replace, Eye, Download, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useRouter } from "next/navigation";
import { initialProjects, initialDocuments } from "@/lib/projects";
import type { Project, Document } from "@/lib/projects";
import { AddProjectForm } from "@/components/add-project-form";
import { useToast } from "@/hooks/use-toast";
import { AddUserForm } from "@/components/add-user-form";
import { AssignTeamForm } from "@/components/assign-team-form";
import { ChangeLeadForm } from "@/components/change-lead-form";
import { getDevelopers, getUsers as getAllUsers, type SanitizedUser } from "@/lib/auth";

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
  const [developers, setDevelopers] = useState<SanitizedUser[]>([]);
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [assignTeamProjectId, setAssignTeamProjectId] = useState<number | null>(null);

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
      const developerUsers = await getDevelopers();
      
      // Set all states after all data has been fetched.
      setUsers(allUsers);
      setDevelopers(developerUsers);

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
    setAssignTeamProjectId(null); // Close the dialog.
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
    setEditingProjectId(null); // Close the dialog.
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
   * Opens a new window to display the document content.
   * This avoids issues with the Next.js router trying to handle the Data URI.
   */
  const handleViewDocument = (doc: Document) => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`<style>body { margin: 0; background: #222; }</style><iframe src="${doc.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100vh;" allowfullscreen></iframe>`);
      newWindow.document.title = doc.name;
    } else {
        toast({
            variant: "destructive",
            title: "Popup Blocked",
            description: "Please allow popups for this site to view documents."
        });
    }
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
   * A reusable component to render a single project card.
   * It displays project details and actions based on the current user's role.
   */
  const ProjectCard = ({ project }: { project: Project }) => {
    const projectDocs = documents.filter(d => d.projectId === project.id);
    const assignedDevsList = users.filter(u => project.assignedDevelopers.includes(u.username));
    const projectLead = users.find(u => u.username === project.lead);
    
    /**
     * [SECURITY] Role-Based Access Control (RBAC) Logic
     * These variables determine if the current user has specific privileges
     * over this project. This ensures a strict separation of duties.
     */
    // Only the assigned project lead can assign developers.
    const canAssignTeam = user?.role === 'project-lead' && user.username === project.lead;
    // Admins and the assigned project lead can upload or delete documents.
    const canManageDocs = user?.role === 'admin' || (user?.role === 'project-lead' && user.username === project.lead);
    // Only admins can change the project lead.
    const canEditProject = user?.role === 'admin';


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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{projectLead?.name || project.lead}</p>
              {/* [PERMISSIONS] The "Change Lead" button is strictly admin-only. */}
              {canEditProject && (
                  <Dialog open={editingProjectId === project.id} onOpenChange={(isOpen) => setEditingProjectId(isOpen ? project.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm"><Replace className="mr-2 h-4 w-4"/> Change</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Project Lead</DialogTitle>
                        <DialogDescription>Assign a new lead for "{project.name}".</DialogDescription>
                      </DialogHeader>
                      <ChangeLeadForm
                        currentLead={project.lead}
                        projectLeads={users.filter(u => u.role === 'project-lead')}
                        onSubmit={(newLead) => handleUpdateProjectLead(project.id, newLead)}
                       />
                    </DialogContent>
                  </Dialog>
              )}
            </div>
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
                <ul className="space-y-2">
                    {projectDocs.map(doc => (
                        <li key={doc.id} className="text-sm flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center truncate">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                <span className="truncate" title={doc.name}>{doc.name}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDocument(doc)} title="View document">
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <a href={doc.url} download={doc.name} title="Download document">
                                     <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </a>
                                {/* [PERMISSIONS] Delete button only for Admins and Project Leads */}
                                {canManageDocs && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/90 hover:text-destructive-foreground" title="Delete document">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the document "{doc.name}".
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                className={buttonVariants({ variant: "destructive" })}
                                                onClick={() => handleDeleteDocument(doc.id)}
                                            >
                                                Yes, delete document
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground">No documents uploaded.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2">
            {/* [PERMISSIONS] The "Assign Team" button is ONLY for the designated Project Lead. */}
            {canAssignTeam && (
                <Dialog open={assignTeamProjectId === project.id} onOpenChange={(isOpen) => setAssignTeamProjectId(isOpen ? project.id : null)}>
                  <DialogTrigger asChild>
                      <Button variant="outline"><UserPlus className="mr-2"/> Assign Team</Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Assign Team to "{project.name}"</DialogTitle>
                          <DialogDescription>Select developers to add or remove from this project.</DialogDescription>
                      </DialogHeader>
                      <AssignTeamForm 
                        developers={developers} 
                        // Pass the list of currently assigned developers to pre-select them.
                        assignedDevelopers={project.assignedDevelopers}
                        onSubmit={(devs) => handleAssignTeam(project.id, devs)}
                      />
                  </DialogContent>
                </Dialog>
            )}
            
            {/* [PERMISSIONS] "Upload Docs" is for Admins and the designated Project Lead. */}
            {canManageDocs && (
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
  const projectLeads = users.filter(u => u.role === 'project-lead');

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
 

    