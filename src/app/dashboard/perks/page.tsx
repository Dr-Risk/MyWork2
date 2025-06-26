
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function PerksPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role === 'contractor') {
      router.replace('/dashboard/users');
    }
  }, [user, isLoading, router]);

  if (user?.role === 'contractor') {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold tracking-tight">Perks</h1>
      <p className="text-muted-foreground">
        Explore benefits and special offers for our members.
      </p>
       <Card className="mt-6">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Award className="w-8 h-8 text-primary"/>
                <div>
                    <CardTitle>Content Under Development</CardTitle>
                    <CardDescription>This section is coming soon. Stay tuned for updates on new perks!</CardDescription>
                </div>
            </div>
        </CardHeader>
      </Card>
    </div>
  );
}
