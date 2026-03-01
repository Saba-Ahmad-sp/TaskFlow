import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse, Task } from "@/types";

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const taskQueries = {
  all: (params: TaskQueryParams = {}) =>
    queryOptions({
      queryKey: ["tasks", params],
      queryFn: () => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            searchParams.set(key, String(value));
          }
        });
        const qs = searchParams.toString();
        return apiClient.fetch<PaginatedResponse>(
          `/tasks${qs ? `?${qs}` : ""}`
        );
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ["tasks", id],
      queryFn: () => apiClient.fetch<{ task: Task }>(`/tasks/${id}`),
    }),
};
