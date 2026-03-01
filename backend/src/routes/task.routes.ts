import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "../controllers/task.controller";
import {
  getTasksSchema,
  taskParamsSchema,
  createTaskSchema,
  updateTaskSchema,
} from "../schemas/task.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate(getTasksSchema), getTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id", validate(taskParamsSchema), getTask);
router.patch("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", validate(taskParamsSchema), deleteTask);
router.patch("/:id/toggle", validate(taskParamsSchema), toggleTask);

export default router;
