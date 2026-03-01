import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
