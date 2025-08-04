
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BookLock } from 'lucide-react';
import { getAuditLogs, type AuditLogEntry } from '@/lib/audit-log';
import { format } from 'date-fns';

/**
 * @fileoverview Audit Log Page
 * @description This page is for Admins to view a log of all significant actions
 * performed within the application, such as logins, user management changes,
 * and project updates.
 */
export default function AuditLogPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * [SECURITY] Route Protection.
     * Ensures only authenticated admin users can access this page.
     */
    useEffect(() => {
        if (!isAuthLoading && user?.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    /**
     * Fetches the audit logs from the mock backend.
     */
    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const logEntries = await getAuditLogs();
            // Sort logs by most recent first
            setLogs(logEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchLogs();
        }
    }, [user]);

    if (isAuthLoading || user?.role !== 'admin') {
        return <Skeleton className="h-96 w-full"/>;
    }

    return (
    <>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Audit Log</h1>
            <p className="text-muted-foreground">A record of all significant events in the system.</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
            {isLoading ? (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
            ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <BookLock className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-headline">No Audit Logs Found</h3>
                    <p className="text-muted-foreground">System events will be recorded here as they occur.</p>
                </div>
            ) : (
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[200px]">Timestamp</TableHead>
                    <TableHead className="w-[150px]">Action</TableHead>
                    <TableHead className="w-[150px]">User</TableHead>
                    <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell className="font-medium">
                            {format(new Date(log.timestamp), "yyyy-MM-dd, HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.username}</TableCell>
                        <TableCell>{log.details}</TableCell>
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
