"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onAddTask?: () => void;
}

export function BottomNav({ onAddTask }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="flex items-center justify-around h-16 px-6">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-colors",
            pathname === "/dashboard"
              ? "text-teal"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">My Tasks</span>
        </Link>

        {/* Add Task — center, prominent */}
        <button
          onClick={onAddTask}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white dark:text-black shadow-lg shadow-teal/20 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Profile */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-colors",
            pathname === "/profile"
              ? "text-teal"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
