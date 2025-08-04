
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  FolderKanban,
  BookLock,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";

/**
 * @fileoverview Sidebar Navigation Component for PixelForge Nexus
 * 
 * @description
 * This component builds the primary navigation menu for the dashboard sidebar.
 * It dynamically renders navigation links based on the authenticated user's role,
 * ensuring that users only see links to pages they are authorized to access.
 */
export function SidebarNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // Defines all possible navigation items, each with an icon, label, URL,
  // and a `roles` array specifying who can see the link.
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'project-lead', 'developer'] },
    { href: "/dashboard/projects", label: "All Projects", icon: FolderKanban, roles: ['admin'] },
    { href: "/dashboard/users", label: "User Management", icon: Users, roles: ['admin'] },
    { href: "/dashboard/audit-log", label: "Audit Log", icon: BookLock, roles: ['admin'] },
    { href: "/dashboard/profile", label: "Account Settings", icon: Settings, roles: ['admin', 'project-lead', 'developer'] },
  ];

  // While the user's authentication status is loading, display a skeleton UI
  // to prevent layout shifts and provide a better user experience.
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
      </div>
    );
  }

  /**
   * Filters the `navItems` array to get only the items the current user
   * is allowed to see based on their role.
   */
  const visibleNavItems = navItems.filter(item => {
    // This should not happen in a protected route, but it's a good safeguard.
    if (!user) return false; 
    // If the item has a roles array, check if the user's role is included.
    return item.roles.includes(user.role);
  });
  
  return (
     <SidebarMenu>
        {visibleNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton 
                   asChild 
                   // The `isActive` prop highlights the current page's link in the sidebar.
                   isActive={pathname === item.href} 
                   tooltip={item.label}
                 >
                    <Link href={item.href}>
                        <item.icon />
                        {/* The label is only visible when the sidebar is expanded. */}
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
      </SidebarMenu>
  );
}
