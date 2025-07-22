
'use client';

import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { getUsers, updateUserRole, lockUserAccount, unlockUserAccount, removeUser, type SanitizedUser } from '@/lib/auth';
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
 * @fileoverview User Management Page
 * @description This page is for Admins to view and manage all user accounts.
 * It provides controls for adding new users, changing roles, locking/unlocking accounts,
 * and removing users.
 */
export default function UsersPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<SanitizedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const { toast } = useToast();

    // Route protection
    useEffect(() => {
        if (!isAuthLoading && user?.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const userList = await getUsers();
            setUsers(userList);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({ variant: "destructive", title: "Error fetching users" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const handleRoleChange = async (username: string, newRole: 'project-lead' | 'developer') => {
        const response = await updateUserRole(username, newRole);
        if (response.success) {
            toast({ title: "Success", description: response.message });
            fetchUsers();
        } else {
            toast({ variant: "destructive", title: "Error", description: response.message });
        }
    };
    
    const handleLockUser = async (username: string) => {
        const response = await lockUserAccount(username);
        if (response.success) {
            toast({ title: 'Success', description: response.message });
            fetchUsers();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: response.message });
        }
    };

    const handleUnlockUser = async (username: string) => {
        const response = await unlockUserAccount(username);
        if (response.success) {
            toast({ title: 'Success', description: response.message });
            fetchUsers();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: response.message });
        }
    };

    const handleRemoveUser = async (username: string) => {
        const response = await removeUser(username);
        if (response.success) {
            toast({ title: 'User Removed', description: response.message });
            fetchUsers();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: response.message });
        }
    };

    const handleUserAdded = () => {
        setIsAddUserDialogOpen(false);
        fetchUsers();
    };
    
    if (isAuthLoading || user?.role !== 'admin') {
        return <Skeleton className="h-96 w-full"/>;
    }

    return (
    <>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Add, remove, and manage user roles and status.</p>
        </div>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create an account for a new Project Lead or Developer.
                    </DialogDescription>
                </DialogHeader>
                <AddUserForm onSuccess={handleUserAdded} />
            </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((u) => (
                    <TableRow key={u.username}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                        <TableCell>
                        {u.isLocked ? (
                            <Badge variant="destructive">Locked</Badge>
                        ) : (
                            <Badge variant="outline">Active</Badge>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        {u.role === 'admin' ? (
                            <Badge>Admin</Badge>
                        ) : (
                            <div className="flex items-center justify-end gap-2">
                            <Select
                                defaultValue={u.role}
                                onValueChange={(newRole: 'project-lead' | 'developer') => handleRoleChange(u.username, newRole)}
                            >
                                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Select role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project-lead">Project Lead</SelectItem>
                                    <SelectItem value="developer">Developer</SelectItem>
                                </SelectContent>
                            </Select>

                            {u.isLocked ? (
                                <Button variant="outline" size="sm" onClick={() => handleUnlockUser(u.username)}><LockOpen className="mr-2 h-4 w-4" />Unlock</Button>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => handleLockUser(u.username)}><Lock className="mr-2 h-4 w-4" />Lock</Button>
                            )}
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Remove</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the account for <strong>{u.name}</strong>.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveUser(u.username)}>Yes, remove user</AlertDialogAction>
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
    </>
    );
}
