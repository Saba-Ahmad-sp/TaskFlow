"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

import { taskQueries } from "@/lib/queries/tasks";
import { TaskCard } from "./task-card";
import { TaskFilters } from "./task-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types";

interface TaskListProps {
  initialTasks?: Task[];
  initialTotal?: number;
}

export function TaskList({ initialTasks, initialTotal }: TaskListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const queryParams = {
    page,
    limit: 10,
    ...(status !== "ALL" && { status }),
    ...(search && { search }),
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const { data, isLoading, isError } = useQuery({
    ...taskQueries.all(queryParams),
    placeholderData: initialTasks
      ? {
          tasks: initialTasks,
          pagination: {
            page: 1,
            limit: 10,
            total: initialTotal ?? initialTasks.length,
            totalPages: Math.ceil(
              (initialTotal ?? initialTasks.length) / 10
            ),
          },
        }
      : undefined,
  });

  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination;

  // Reset page when filters change
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <TaskFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>Failed to load tasks. Please try again.</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <ClipboardList className="mx-auto h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm mt-1">
            {search || status !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first task to get started"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
