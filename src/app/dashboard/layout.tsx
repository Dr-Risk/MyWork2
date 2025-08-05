
'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Menu, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

/**
 * @fileoverview Main Dashboard Layout for PixelForge Nexus
 * 
 * @description
 * This component defines the primary layout for the authenticated part of the application.
 * It includes a persistent sidebar, a header with user navigation, and a main content area.
 * It also handles route protection by redirecting unauthenticated users to the login page.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  /**
   * [SECURITY] Client-side route protection.
   * This `useEffect` hook runs when the component mounts or when its dependencies change.
   * If the authentication check is complete (`!isLoading`) and there is no authenticated
   * user (`!user`), it redirects the user to the login page ('/'). This prevents
   * unauthenticated access to any page that uses this layout.
   */
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // While the authentication status is being checked, display a loading spinner.
  // This provides feedback to the user and prevents a flash of unstyled/unprotected content.
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Once the user is authenticated, render the main dashboard layout.
  return (
     <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <a
            href="/dashboard"
            className="flex items-center gap-2 font-semibold font-headline"
          >
            <Logo />
            <span className={cn("group-data-[collapsible=icon]:hidden")}>PixelForge Nexus</span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          {/* The primary navigation menu, which renders items based on user role. */}
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          {/* A trigger to open the sidebar on mobile devices. */}
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1 flex items-center gap-2">
             <span className="text-sm font-semibold">Welcome, {user.name}</span>
             <Badge variant="outline" className="capitalize">{user.role.replace('-', ' ')}</Badge>
          </div>
          {/* The user navigation dropdown (profile, settings, logout). */}
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {/* The main content for each specific dashboard page will be rendered here. */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
