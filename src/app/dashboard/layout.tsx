
'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Menu, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

/**
 * @fileoverview Main Dashboard Layout
 * 
 * @description
 * This component defines the primary layout for the authenticated part of the application.
 * It includes a persistent sidebar (collapsible on desktop), a header with user navigation,
 * and a main content area where nested pages are rendered. It also handles route
 * protection by redirecting unauthenticated users to the login page.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // State to manage the collapsed/expanded state of the desktop sidebar.
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    /**
     * [SECURITY] This is a client-side route protection check.
     *
     * OWASP Recommendation (A01 - Broken Access Control):
     * While client-side checks are good for user experience (e.g., quick redirects),
     * they are not a substitute for server-side authorization. A malicious actor
     * could bypass this client-side code.
     *
     * In a production application, every page load and API request for protected
     * resources must be verified on the server to ensure the user has a valid
     * session and the necessary permissions.
     */
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Display a loading spinner while the authentication state is being determined.
  // This prevents a flash of the login page for already authenticated users.
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // The main layout grid. It uses a CSS grid that adjusts its columns based on
  // the sidebar's collapsed state for a responsive feel.
  return (
    <div className={cn(
      "grid min-h-screen w-full transition-all",
      isCollapsed ? "md:grid-cols-[64px_1fr]" : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
    )}>
      {/* Sidebar for desktop view. It's hidden on mobile. */}
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-14 shrink-0 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a
              href="/dashboard"
              className="flex items-center gap-2 font-semibold font-headline"
            >
              <Logo />
              {/* The app name is hidden when the sidebar is collapsed. */}
              <span className={cn(isCollapsed && "hidden")}>MediTask</span>
            </a>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SidebarNav isCollapsed={isCollapsed} />
          </div>
          {/* Footer of the sidebar containing the collapse/expand button. */}
          <div className="mt-auto p-4 border-t">
             <Button
                onClick={() => setIsCollapsed(!isCollapsed)}
                size={isCollapsed ? "icon" : "default"}
                variant="outline"
                className="w-full"
            >
                {isCollapsed ? <PanelLeftOpen className="h-4 w-4"/> : <PanelLeftClose className="h-4 w-4"/>}
                <span className={cn(isCollapsed && "sr-only")}>{isCollapsed ? "Expand" : "Collapse"}</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Header for the main content area */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          {/* Mobile navigation toggle (hamburger menu). Uses a Sheet component for the slide-out menu. */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
              <div className="flex h-14 shrink-0 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 font-semibold font-headline"
                >
                  <Logo />
                  <span className="">MediTask</span>
                </a>
              </div>
              <SidebarNav isCollapsed={false} />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Future components like breadcrumbs or global search can go here */}
          </div>
          <UserNav />
        </header>
        {/* Main content area where child pages are rendered */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
