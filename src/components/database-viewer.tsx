
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getUsers, updateUserRole, type SanitizedUser, updateUserSuperUserStatus, lockUserAccount, unlockUserAccount, removeUser } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Database, PlusCircle, Lock, LockOpen, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddUserForm } from '@/components/add-user-form';
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
 * @fileoverview Mock Database Viewer Component
 * 
 * @description
 * This component provides a user interface for administrators to view and manage
 * all user accounts in the mock database. It displays users in a table and provides
 * controls for adding new users, changing roles, toggling super user status,
 * locking/unlocking accounts, and removing users.
 */
export function DatabaseViewer() {
  // State management for the user list, loading status, and the 'Add User' dialog.
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetches the list of users from the mock backend.
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: "Could not load user data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // This effect runs on component mount to fetch the initial user list.
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handler for changing a user's role. It calls the mock API and then refetches the user list.
  const handleRoleChange = async (
    username: string,
    newRole: 'full-time' | 'contractor'
  ) => {
    // [SECURITY] This action is protected on the backend (see src/lib/auth.ts)
    // to ensure only authorized users can change roles.
    const response = await updateUserRole(username, newRole);

    if (response.success) {
      toast({ title: "Success", description: response.message });
      await fetchUsers(); // Refetch to show the updated data.
    } else {
      toast({ variant: "destructive", title: "Error", description: response.message });
    }
  };

  // Handler for changing a user's super user status.
  const handleSuperUserChange = async (
    username: string,
    isSuperUser: boolean
  ) => {
    const response = await updateUserSuperUserStatus(username, isSuperUser);

    if (response.success) {
        toast({ title: "Success", description: response.message });
        await fetchUsers();
    } else {
        toast({ variant: "destructive", title: "Error", description: response.message });
        // Refetch even on failure to revert the optimistic UI of the switch component.
        await fetchUsers(); 
    }
  };

  // Handler for locking a user's account.
  const handleLockUser = async (username: string) => {
    const response = await lockUserAccount(username);
    if (response.success) {
      toast({ title: 'Success', description: response.message });
      fetchUsers();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: response.message });
    }
  };

  // Handler for unlocking a user's account.
  const handleUnlockUser = async (username: string) => {
    const response = await unlockUserAccount(username);
    if (response.success) {
      toast({ title: 'Success', description: response.message });
      fetchUsers();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: response.message });
    }
  };

  // Handler for removing a user.
  const handleRemoveUser = async (username: string) => {
    const response = await removeUser(username);
    if (response.success) {
      toast({ title: 'User Removed', description: response.message });
      fetchUsers();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: response.message });
    }
  };

  // Callback function for when a new user is successfully added via the form.
  const handleUserAdded = () => {
    setIsAddUserDialogOpen(false); // Close the dialog.
    fetchUsers(); // Refresh the user list.
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Mock Database Viewer</CardTitle>
              <CardDescription>
                A view of the current users. Admins can add users and manage roles.
              </CardDescription>
            </div>
          </div>
          {/* Dialog for adding a new user. */}
           <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Manually create a new user account. The default password is 'DefaultPassword123'.
                    </DialogDescription>
                </DialogHeader>
                <AddUserForm onSuccess={handleUserAdded} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Show skeleton loaders while fetching data. */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Super User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Password Last Changed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Map over the users and render a row for each one. */}
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">
                      {/*
                        * [SECURITY] Cross-Site Scripting (XSS) Prevention
                        * React automatically escapes the `user.username` string, preventing
                        * any malicious scripts it might contain from being executed.
                        */}
                      {user.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {/* Super User switch is only available for non-admin users. */}
                      {user.role !== 'admin' ? (
                          <div className="flex items-center">
                              <Switch
                                  id={`superuser-switch-${user.username}`}
                                  checked={!!user.isSuperUser}
                                  disabled={user.role === 'contractor'} // Contractors can't be super users.
                                  onCheckedChange={(checked) => handleSuperUserChange(user.username, checked)}
                                  aria-label={`Toggle super user status for ${user.username}`}
                              />
                          </div>
                      ) : (
                          <Badge variant="outline">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isLocked ? (
                        <Badge variant="destructive">Locked</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.passwordLastChanged).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Admins cannot be modified from this interface. */}
                      {user.role === 'admin' ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {/* Role selection dropdown */}
                          <Select
                            defaultValue={user.role}
                            onValueChange={(
                              newRole: 'full-time' | 'contractor'
                            ) => handleRoleChange(user.username, newRole)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="contractor">Contractor</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Lock/Unlock button */}
                          {user.isLocked ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnlockUser(user.username)}
                                >
                                    <LockOpen className="mr-2 h-4 w-4" />
                                    Unlock
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLockUser(user.username)}
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Lock
                                </Button>
                            )}
                          
                           {/* Remove user button with confirmation dialog */}
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the account for <strong>{user.name} ({user.username})</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveUser(user.username)}
                                  >
                                    Yes, remove user
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
