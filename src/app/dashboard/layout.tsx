
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
   */
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
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
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Future components like breadcrumbs or global search can go here */}
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
