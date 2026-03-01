"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";

const pageInfo: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "My Tasks", subtitle: "Manage and track your tasks" },
  "/profile": { title: "Profile", subtitle: "Your account information" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const pathname = usePathname();
  const { title, subtitle } = pageInfo[pathname] || pageInfo["/dashboard"];

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <AppSidebar onAddTask={() => setShowAddTask(true)} />

      {/* Main content */}
      <div className="flex flex-col md:ml-64">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav onAddTask={() => setShowAddTask(true)} />

      {/* Add task dialog (shared between sidebar button and bottom nav) */}
      <TaskFormDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        mode="create"
      />
    </div>
  );
}
