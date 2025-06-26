
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DeveloperPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== 'admin') {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64 mt-1" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
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
    </div>
  );
}
