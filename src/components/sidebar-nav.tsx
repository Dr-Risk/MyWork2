
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Library,
  Award,
  Users,
  Code,
  HelpCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

/**
 * @fileoverview Sidebar Navigation Component
 * 
 * @description
 * This component builds the navigation menu displayed in the dashboard sidebar.
 * It dynamically renders navigation items based on the user's role and permissions,
 * ensuring users only see links to pages they are authorized to access.
 * This is an implementation of the "Principle of Least Privilege" in the UI.
 * It also adapts its appearance based on the sidebar's collapsed state.
 */

// Defines the main navigation items available to most users.
const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/blog", label: "Blogs", icon: PenSquare },
  { href: "/dashboard/events", label: "New Events", icon: Calendar },
  { href: "/dashboard/resources", label: "Resources", icon: Library },
  { href: "/dashboard/perks", label: "Perks", icon: Award },
  { href: "/dashboard/users", label: "Connect with Friends", icon: Users },
];

// Defines secondary or administrative navigation items.
const secondaryNavItems = [
  { href: "/dashboard/developer", label: "Developer", icon: Code },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // A helper function to render a single navigation item.
  // It handles active state styling and tooltips for the collapsed view.
  const renderNavItem = (item: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) => {
    // Determine if the link is active by checking if the current pathname starts with the link's href.
    const isActive =
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href);
    
    const link = (
        <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary", // Apply active styles
              isCollapsed && "justify-center" // Center the icon when collapsed
            )}
        >
            <item.icon className="h-4 w-4" />
            <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
        </Link>
    );

    // If the sidebar is collapsed, wrap the link in a Tooltip for better UX.
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

  // Show skeleton loaders while authentication state is being determined.
  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-between">
        <nav className="grid items-start gap-2 px-2 pt-4 text-sm font-medium lg:px-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </nav>
        <nav className="grid items-start gap-2 px-2 pb-4 text-sm font-medium lg:px-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </nav>
      </div>
    );
  }

  /**
   * [SECURITY] UI-level enforcement of the Principle of Least Privilege.
   * By filtering the navigation items based on the user's role, we prevent
   * non-privileged users from even seeing links to sections they shouldn't access.
   * This is a crucial UX feature that complements server-side authorization.
   */
  const privilegedNavItems = secondaryNavItems.filter(item => {
    if (item.href === '/dashboard/developer') {
        // Only admins and super users can see the Developer link.
        return user?.role === 'admin' || user?.isSuperUser;
    }
    if (item.href === '/dashboard/settings') {
        // Only admins can see the Settings link.
        return user?.role === 'admin';
    }
    return true; // Help is visible to everyone.
  });

  // Filter the main navigation items based on the user's role.
  let visibleMainNavItems;
  if (user?.role === 'contractor') {
    // Contractors only see their tasks page, with a relabeled link.
    visibleMainNavItems = mainNavItems
      .filter((item) => item.href === '/dashboard/users')
      .map((item) => ({ ...item, label: 'My Tasks' }));
  } else if (user?.role === 'admin' || user?.role === 'full-time') {
    // Admins and full-time employees see all main navigation items.
    visibleMainNavItems = mainNavItems;
  } else { 
    // This case would handle other roles, like a hypothetical "guest" user.
    visibleMainNavItems = mainNavItems.filter(
      (item) =>
        item.href !== "/dashboard/resources" && item.href !== "/dashboard/perks"
    );
  }

  // The final rendered navigation container.
  const navContainer = (
    <div className="flex h-full flex-col justify-between">
      <nav className="grid items-start px-2 pt-4 text-sm font-medium lg:px-4">
        {visibleMainNavItems.map(renderNavItem)}
      </nav>
      <nav className="grid items-start px-2 pb-4 text-sm font-medium lg:px-4">
        {privilegedNavItems.map(renderNavItem)}
      </nav>
    </div>
  );

  // Wrap the entire navigation in a TooltipProvider if the sidebar is collapsed.
  return isCollapsed ? <TooltipProvider>{navContainer}</TooltipProvider> : navContainer;
}
