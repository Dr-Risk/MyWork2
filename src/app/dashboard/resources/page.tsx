
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Library } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

export default function ResourcesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role === 'contractor') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role === 'contractor') {
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
        Resources
      </h1>
      <p className="text-muted-foreground">
        Access clinical guidelines, research papers, and more.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Library className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on available resources!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
