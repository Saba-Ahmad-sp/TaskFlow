import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { registerSchema, loginSchema, updateProfileSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, validate(updateProfileSchema), updateMe);

export default router;
