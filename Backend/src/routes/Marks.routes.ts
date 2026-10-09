
import { Router } from "express";

import {
  createMarks,
  getAllMarks,
  getMarksById,
  getStudentMarks,
  updateMarks,
  deleteMarks,
} from "../controllers/Marks.controller";

const router = Router();

// Create marks
router.post("/", createMarks);

// Get all marks
router.get("/", getAllMarks);

// Get marks for a specific student
// Keep this route before /:id
router.get("/student/:studentId", getStudentMarks);

// Get marks by ID
router.get("/:id", getMarksById);

// Update marks
router.put("/:id", updateMarks);

// Delete marks
router.delete("/:id", deleteMarks);

export default router;
