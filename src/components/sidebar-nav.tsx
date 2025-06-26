
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

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/blog", label: "Blogs", icon: PenSquare },
  { href: "/dashboard/events", label: "New Events", icon: Calendar },
  { href: "/dashboard/resources", label: "Resources", icon: Library },
  { href: "/dashboard/perks", label: "Perks", icon: Award },
  { href: "/dashboard/users", label: "Connect with Friends", icon: Users },
];

const secondaryNavItems = [
  { href: "/dashboard/developer", label: "Developer", icon: Code },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const renderNavItem = (item: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const isActive =
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname.startsWith(item.href);
    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          isActive && "bg-muted text-primary"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

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

  const privilegedNavItems =
    user?.role === "admin"
      ? secondaryNavItems
      : secondaryNavItems.filter(
          (item) =>
            item.href !== "/dashboard/developer" &&
            item.href !== "/dashboard/settings"
        );

  let visibleMainNavItems;

  if (user?.role === 'contractor') {
    visibleMainNavItems = mainNavItems
      .filter((item) => item.href === '/dashboard/users')
      .map((item) => ({ ...item, label: 'My Tasks' }));
  } else if (user?.role === 'admin' || user?.role === 'full-time') {
    visibleMainNavItems = mainNavItems;
  } else { // Guest users
    visibleMainNavItems = mainNavItems.filter(
      (item) =>
        item.href !== "/dashboard/resources" && item.href !== "/dashboard/perks"
    );
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <nav className="grid items-start px-2 pt-4 text-sm font-medium lg:px-4">
        {visibleMainNavItems.map(renderNavItem)}
      </nav>
      <nav className="grid items-start px-2 pb-4 text-sm font-medium lg:px-4">
        {privilegedNavItems.map(renderNavItem)}
      </nav>
    </div>
  );
}
