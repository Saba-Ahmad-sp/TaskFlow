"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, LogOut, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logoutAction } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "My Tasks" },
  { href: "/profile", icon: User, label: "Profile" },
];

interface AppSidebarProps {
  onAddTask?: () => void;
}

export function AppSidebar({ onAddTask }: AppSidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    toast.success("Logged out successfully");
    await logoutAction();
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-border bg-background/95 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 text-teal font-bold">
          T
        </div>
        <span className="text-lg font-semibold">TaskFlow</span>
      </div>

      <Separator />

      {/* Add Task Button */}
      <div className="px-4 py-4">
        <Button
          onClick={onAddTask}
          className="w-full bg-teal hover:bg-teal-dark text-white dark:text-black font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal/10 text-teal"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4">
        <Separator className="mb-4" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
