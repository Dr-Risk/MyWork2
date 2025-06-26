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

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/blog", label: "Blogs", icon: PenSquare },
  { href: "/dashboard/events", label: "New Events", icon: Calendar },
  { href: "/dashboard/resources", label: "Resources", icon: Library },
  { href: "/dashboard/perks", label: "Perks", icon: Award },
  { href: "/dashboard/users", label: "Other Users", icon: Users },
];

const secondaryNavItems = [
  { href: "/dashboard/developer", label: "Developer", icon: Code },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

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

  return (
    <div className="flex h-full flex-col justify-between">
      <nav className="grid items-start px-2 pt-4 text-sm font-medium lg:px-4">
        {mainNavItems.map(renderNavItem)}
      </nav>
      <nav className="grid items-start px-2 pb-4 text-sm font-medium lg:px-4">
        {secondaryNavItems.map(renderNavItem)}
      </nav>
    </div>
  );
}
