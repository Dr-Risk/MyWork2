
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
import { getUsers, updateUserRole, type SanitizedUser, updateUserSuperUserStatus } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export function DatabaseViewer() {
  const [users, setUsers] = useState<SanitizedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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


  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Database className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>Mock Database Viewer</CardTitle>
            <CardDescription>
              A view of the current users in the mock database. You can change user roles here.
            </CardDescription>
          </div>
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
                  <TableHead>Role</TableHead>
                  <TableHead>Super User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password Last Changed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' ? (
                          <div className="flex items-center">
                              <Switch
                                  id={`superuser-switch-${user.username}`}
                                  checked={!!user.isSuperUser}
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
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.passwordLastChanged).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge>Admin</Badge>
                      ) : (
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
