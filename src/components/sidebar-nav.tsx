
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

/**
 * @fileoverview Sidebar Navigation Component for PixelForge Nexus
 * 
 * @description
 * This component builds the navigation menu for the dashboard. It dynamically renders
 * navigation items based on the user's role (Admin, Project Lead, Developer).
 */
export function SidebarNav({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "All Projects", icon: FolderKanban, roles: ['admin'] },
    { href: "/dashboard/users", label: "User Management", icon: Users, roles: ['admin'] },
    { href: "/dashboard/profile", label: "Account Settings", icon: Settings, roles: ['admin', 'project-lead', 'developer'] },
  ];

  const renderNavItem = (item: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const isActive = pathname === item.href;
    
    const link = (
        <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary",
              isCollapsed && "justify-center"
            )}
        >
            <item.icon className="h-4 w-4" />
            <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
        </Link>
    );

    if (isCollapsed) {
        return (
            <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                    {link}
                </TooltipTrigger>
                <TooltipContent side="right">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        );
    }
    
    return link;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
      </div>
    );
  }

  const visibleNavItems = navItems.filter(item => {
    if (!user || !item.roles) return true; // Show items with no specific roles
    return item.roles.includes(user.role);
  });
  
  const navContainer = (
     <nav className="grid items-start p-2 text-sm font-medium lg:p-4">
        {visibleNavItems.map(renderNavItem)}
      </nav>
  );

  return isCollapsed ? <TooltipProvider>{navContainer}</TooltipProvider> : navContainer;
}
