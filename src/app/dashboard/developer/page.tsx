
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DatabaseViewer } from "@/components/database-viewer";

export default function DeveloperPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !(user?.role === 'admin' || user?.isSuperUser)) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (!(user?.role === 'admin' || user?.isSuperUser)) {
    return null;
  }

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
      <DatabaseViewer />
    </div>
  );
}
