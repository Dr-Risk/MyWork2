
'use client';

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { CheckCircle2, Download, Eye, FileText, HardDriveUpload, Replace, Trash2, UserPlus } from "lucide-react";
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
import { ChangeLeadForm } from "@/components/change-lead-form";
import { AssignTeamForm } from "@/components/assign-team-form";
import { useToast } from "@/hooks/use-toast";

import type { Project, Document } from "@/lib/projects";
import type { SanitizedUser, UserProfile } from "@/lib/auth";

/**
 * @fileoverview Project Card Component
 * @description This component renders a single project card. It has been extracted
 * from the main dashboard page for performance optimization. By wrapping it with
 * React.memo, we prevent it from re-rendering unless its specific props change.
 */

type ProjectCardProps = {
  project: Project;
  documents: Document[];
  users: SanitizedUser[];
  developers: SanitizedUser[];
  projectLeads: SanitizedUser[];
  currentUser: UserProfile;
  onCompleteProject: (projectId: number) => void;
  onAssignTeam: (projectId: number, developers: string[]) => void;
  onUpdateProjectLead: (projectId: number, newLead: string) => void;
  onFileUpload: (projectId: number, file: File) => void;
  onDeleteDocument: (documentId: number) => void;
};

/**
 * [PERFORMANCE] ProjectCard is wrapped in React.memo.
 * This is a higher-order component that memoizes the rendered output of the
 * component. This means React will skip rendering the component and reuse the
 * last rendered result if its props have not changed. This is a crucial
 * optimization for list items to prevent the entire list from re-rendering
 * when only one item's data changes.
 */
export const ProjectCard = React.memo(function ProjectCard({
    project,
    documents: projectDocs,
    users,
    developers,
    projectLeads,
    currentUser,
    onCompleteProject,
    onAssignTeam,
    onUpdateProjectLead,
    onFileUpload,
    onDeleteDocument,
}: ProjectCardProps) {
  
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [isAssigningTeam, setIsAssigningTeam] = useState(false);
  const { toast } = useToast();

  const assignedDevsList = users.filter(u => project.assignedDevelopers.includes(u.username));
  const projectLead = users.find(u => u.username === project.lead);

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
   * [SECURITY] Role-Based Access Control (RBAC) Logic
   * These variables determine if the current user has specific privileges
   * over this project. This ensures a strict separation of duties.
   */
  const canAssignTeam = currentUser?.role === 'project-lead' && currentUser.username === project.lead;
  const canManageDocs = currentUser?.role === 'admin' || (currentUser?.role === 'project-lead' && currentUser.username === project.lead);
  const canEditProject = currentUser?.role === 'admin';

  // Internal submit handlers to close dialogs
  const handleAssignTeamSubmit = (devs: string[]) => {
    onAssignTeam(project.id, devs);
    setIsAssigningTeam(false);
  };
  
  const handleUpdateLeadSubmit = (newLead: string) => {
    onUpdateProjectLead(project.id, newLead);
    setIsEditingLead(false);
  };

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
                <Dialog open={isEditingLead} onOpenChange={setIsEditingLead}>
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
                      projectLeads={projectLeads}
                      onSubmit={handleUpdateLeadSubmit}
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
                                              onClick={() => onDeleteDocument(doc.id)}
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
              <Dialog open={isAssigningTeam} onOpenChange={setIsAssigningTeam}>
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
                      assignedDevelopers={project.assignedDevelopers}
                      onSubmit={handleAssignTeamSubmit}
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
          <input type="file" id={`file-upload-${project.id}`} className="hidden" onChange={(e) => e.target.files && onFileUpload(project.id, e.target.files[0])}/>
          
          {/* [PERMISSIONS] The "Mark as Complete" action is strictly admin-only. */}
          {currentUser?.role === 'admin' && project.status === 'Active' && (
               <Button variant="default" onClick={() => onCompleteProject(project.id)} className="col-span-2">
                  <CheckCircle2 className="mr-2"/> Mark as Complete
              </Button>
          )}
      </CardFooter>
    </Card>
  );
});
