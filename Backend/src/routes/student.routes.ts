import { Router } from "express";

import {
  createStudent,
  getStudentProfile,
} from "../controllers/student.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/", createStudent);
router.get("/:id", protect, getStudentProfile);

export default router;