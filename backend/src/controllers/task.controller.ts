import { Request, Response } from "express";
import * as taskService from "../services/task.service";

// Express 5 auto-catches async errors — no try/catch needed
// req.validated contains Zod-parsed data (Express 5 req.query is read-only)

export async function getTasks(req: Request, res: Response) {
  const query = req.validated?.query ?? req.query;
  const result = await taskService.getTasks(req.user!.userId, query);
  res.status(200).json(result);
}

export async function getTask(req: Request, res: Response) {
  const task = await taskService.getTaskById(req.user!.userId, req.params.id);
  res.status(200).json({ task });
}

export async function createTask(req: Request, res: Response) {
  const task = await taskService.createTask(req.user!.userId, req.body);
  res.status(201).json({ task });
}

export async function updateTask(req: Request, res: Response) {
  const task = await taskService.updateTask(
    req.user!.userId,
    req.params.id,
    req.body
  );
  res.status(200).json({ task });
}

export async function deleteTask(req: Request, res: Response) {
  await taskService.deleteTask(req.user!.userId, req.params.id);
  res.status(200).json({ message: "Task deleted successfully" });
}

export async function toggleTask(req: Request, res: Response) {
  const task = await taskService.toggleTask(req.user!.userId, req.params.id);
  res.status(200).json({ task });
}
