"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/server-api";
import type { Task } from "@/types";
import type { TaskFormData } from "@/lib/schemas/task";

export async function createTaskAction(data: TaskFormData) {
  try {
    const result = await serverFetch<{ task: Task }>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath("/dashboard");
    return { success: true, task: result.task };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create task";
    return { success: false, error: message };
  }
}

export async function updateTaskAction(id: string, data: Partial<TaskFormData>) {
  try {
    const result = await serverFetch<{ task: Task }>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    revalidatePath("/dashboard");
    return { success: true, task: result.task };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update task";
    return { success: false, error: message };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    await serverFetch(`/tasks/${id}`, { method: "DELETE" });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete task";
    return { success: false, error: message };
  }
}

export async function toggleTaskAction(id: string) {
  try {
    const result = await serverFetch<{ task: Task }>(`/tasks/${id}/toggle`, {
      method: "PATCH",
    });
    revalidatePath("/dashboard");
    return { success: true, task: result.task };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle task";
    return { success: false, error: message };
  }
}
