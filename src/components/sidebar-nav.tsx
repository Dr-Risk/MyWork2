
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";

/**
 * @fileoverview Sidebar Navigation Component for PixelForge Nexus
 * 
 * @description
 * This component builds the navigation menu for the dashboard. It dynamically renders
 * navigation items based on the user's role (Admin, Project Lead, Developer).
 */
export function SidebarNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'project-lead', 'developer'] },
    { href: "/dashboard/projects", label: "All Projects", icon: FolderKanban, roles: ['admin'] },
    { href: "/dashboard/users", label: "User Management", icon: Users, roles: ['admin'] },
    { href: "/dashboard/profile", label: "Account Settings", icon: Settings, roles: ['admin', 'project-lead', 'developer'] },
  ];

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
    if (!user || !item.roles) return true; // Should not happen, but as a safeguard
    return item.roles.includes(user.role);
  });
  
  return (
     <SidebarMenu>
        {visibleNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                 <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                    <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
      </SidebarMenu>
  );
}
