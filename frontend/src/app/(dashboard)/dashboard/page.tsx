import { serverFetch } from "@/lib/server-api";
import { TaskList } from "@/components/tasks/task-list";
import type { PaginatedResponse } from "@/types";

export default async function DashboardPage() {
  let initialData: PaginatedResponse | null = null;

  try {
    initialData = await serverFetch<PaginatedResponse>(
      "/tasks?page=1&limit=10&sortBy=createdAt&sortOrder=desc"
    );
  } catch {
    // Will fall through to client-side fetch
  }

  return (
    <div className="space-y-6">
      <TaskList
        initialTasks={initialData?.tasks}
        initialTotal={initialData?.pagination.total}
      />
    </div>
  );
}
