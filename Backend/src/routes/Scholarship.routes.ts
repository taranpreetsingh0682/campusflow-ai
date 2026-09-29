import { Router } from "express";

import {
  createScholarship,
  getAllScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
} from "../controllers/Scholarship.controller";

const router = Router();

// Create scholarship
router.post("/", createScholarship);

// Get all scholarships
router.get("/", getAllScholarships);

// Get scholarship by ID
router.get("/:id", getScholarshipById);

// Update scholarship
router.put("/:id", updateScholarship);

// Delete scholarship
router.delete("/:id", deleteScholarship);

export default router;