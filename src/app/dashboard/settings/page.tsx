
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * @fileoverview Settings Page
 * 
 * @description
 * A page for application settings, accessible only to administrators.
 * This demonstrates role-based access control.
 */
export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  /**
   * [SECURITY] Client-Side Route Protection.
   * 
   * OWASP A01: Broken Access Control & Principle of Least Privilege:
   * This `useEffect` hook ensures only users with the 'admin' role can view this page.
   * It is a client-side implementation of access control.
   *
   * As with other protected pages, this is NOT a substitute for server-side authorization.
   * Any actions performed on this page that modify settings must be validated on the
   * server to ensure the user is an administrator.
   */
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // Return null to prevent a content flicker for non-admins before redirect.
  if (user?.role !== 'admin') {
    return null;
  }

  // Render the page content for authorized admins.
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">
        Settings
      </h1>
      <p className="text-muted-foreground">
        Manage your account and notification preferences.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Settings className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your profile, password, and notification settings here.</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
