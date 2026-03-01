import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error-handler";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  GetTasksQuery,
} from "../schemas/task.schema";
import { Prisma, TaskStatus } from "../generated/prisma/client";

export async function getTasks(userId: string, query: GetTasksQuery) {
  const { page, limit, status, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.TaskWhereInput = {
    userId,
    ...(status && { status: status as TaskStatus }),
    ...(search && {
      title: { contains: search, mode: "insensitive" as Prisma.QueryMode },
    }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  if (task.userId !== userId) {
    throw new AppError(403, "Not authorized to access this task");
  }

  return task;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status as TaskStatus,
      priority: input.priority as any,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      userId,
    },
  });
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  await getTaskById(userId, taskId);

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.status !== undefined && {
        status: input.status as TaskStatus,
      }),
      ...(input.priority !== undefined && { priority: input.priority as any }),
      ...(input.startDate !== undefined && {
        startDate: input.startDate ? new Date(input.startDate) : null,
      }),
      ...(input.endDate !== undefined && {
        endDate: input.endDate ? new Date(input.endDate) : null,
      }),
    },
  });
}

export async function deleteTask(userId: string, taskId: string) {
  await getTaskById(userId, taskId);

  await prisma.task.delete({
    where: { id: taskId },
  });
}

export async function toggleTask(userId: string, taskId: string) {
  const task = await getTaskById(userId, taskId);

  const newStatus: TaskStatus =
    task.status === "COMPLETED" ? "TODO" : "COMPLETED";

  return prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });
}
