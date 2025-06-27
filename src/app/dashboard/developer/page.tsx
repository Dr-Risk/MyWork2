
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DatabaseViewer } from "@/components/database-viewer";

/**
 * @fileoverview Developer Tools Page
 * 
 * @description
 * This page is exclusively for users with 'admin' or 'super user' privileges.
 * It provides access to developer-focused tools, such as the mock database viewer.
 * It demonstrates role-based access control on the client-side.
 */
export default function DeveloperPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  /**
   * [SECURITY] Client-Side Route Protection.
   * This `useEffect` hook checks if the current user has the required permissions.
   * If not, it redirects them to the main dashboard. While this provides a good
   * user experience by preventing access to the UI, it's NOT a substitute for
   * server-side authorization. A malicious user could bypass this client-side
   * check. All sensitive data and actions must be protected on the server.
   */
  useEffect(() => {
    if (!isLoading && !(user?.role === 'admin' || user?.isSuperUser)) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // If the user does not have the correct role, render nothing to avoid a flicker
  // of content before the redirect happens.
  if (!(user?.role === 'admin' || user?.isSuperUser)) {
    return null;
  }

  // Render the developer page content for authorized users.
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        Developer
      </h1>
      <p className="text-muted-foreground">
        Access API documentation and developer tools.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Code className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage API keys for integrations and developer access.</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
      {/* The DatabaseViewer component shows the list of users and allows management. */}
      <DatabaseViewer />
    </div>
  );
}
