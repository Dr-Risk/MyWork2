
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


export function DatabaseViewer() {
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (
    username: string,
    newRole: 'full-time' | 'contractor'
  ) => {
    const response = await updateUserRole(username, newRole);

    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
      await fetchUsers(); // Refetch users to show the updated role
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.message,
      });
    }
  };

  const handleSuperUserChange = async (
    username: string,
    isSuperUser: boolean
  ) => {
    const response = await updateUserSuperUserStatus(username, isSuperUser);

    if (response.success) {
        toast({
            title: "Success",
            description: response.message,
        });
        await fetchUsers();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: response.message,
        });
        // We need to refetch to revert the switch state visually on failure
        await fetchUsers(); 
    }
  };

  const handleLockUser = async (username: string) => {
    const response = await lockUserAccount(username);
    if (response.success) {
      toast({
        title: 'Success',
        description: response.message,
      });
      fetchUsers();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.message,
      });
    }
  };

  const handleUnlockUser = async (username: string) => {
    const response = await unlockUserAccount(username);
    if (response.success) {
      toast({
        title: 'Success',
        description: response.message,
      });
      fetchUsers();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.message,
      });
    }
  };

  const handleRemoveUser = async (username: string) => {
    const response = await removeUser(username);
    if (response.success) {
      toast({
        title: 'User Removed',
        description: response.message,
      });
      fetchUsers();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.message,
      });
    }
  };

  const handleUserAdded = () => {
    setIsAddUserDialogOpen(false);
    fetchUsers();
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
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' ? (
                          <div className="flex items-center">
                              <Switch
                                  id={`superuser-switch-${user.username}`}
                                  checked={!!user.isSuperUser}
                                  disabled={user.role === 'contractor'}
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
                      {user.role === 'admin' ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
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
