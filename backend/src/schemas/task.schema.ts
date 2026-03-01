import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().max(1000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const getTasksSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(50).default(10),
      status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
      search: z.string().optional(),
      sortBy: z
        .enum(["createdAt", "startDate", "endDate", "priority", "title"])
        .default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    })
    .default(() => ({ page: 1, limit: 10, sortBy: "createdAt" as const, sortOrder: "desc" as const })),
});

export const taskParamsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type GetTasksQuery = z.infer<typeof getTasksSchema>["query"];
