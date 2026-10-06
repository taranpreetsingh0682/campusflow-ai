import { Router } from "express";

import {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/Enrollment.controller";

const router = Router();

// CREATE ENROLLMENT
router.post("/", createEnrollment);

// GET ALL ENROLLMENTS
router.get("/", getAllEnrollments);

// GET ENROLLMENT BY ID
router.get("/:id", getEnrollmentById);

// UPDATE ENROLLMENT
router.put("/:id", updateEnrollment);

// DELETE ENROLLMENT
router.delete("/:id", deleteEnrollment);

export default router;