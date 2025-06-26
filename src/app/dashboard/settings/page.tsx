
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (user?.role !== 'admin') {
    return null;
  }

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
