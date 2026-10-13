
import { Router } from "express";

import {
  createStudentFee,
  getAllStudentFees,
  getStudentFeeById,
  getMyStudentFees,
  updateStudentFee,
  deleteStudentFee,
} from "../controllers/StudentFee.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// Create a student fee record
router.post("/", createStudentFee);

// Get all student fee records
router.get("/", getAllStudentFees);

// Test route
router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Student Fee route is working",
  });
});

// Get fees for the currently authenticated student
router.get("/my-fees", protect, getMyStudentFees);

// Get a fee record by ID
router.get("/:id", getStudentFeeById);

// Update a fee record
router.put("/:id", updateStudentFee);

// Delete a fee record
router.delete("/:id", deleteStudentFee);

export default router;
