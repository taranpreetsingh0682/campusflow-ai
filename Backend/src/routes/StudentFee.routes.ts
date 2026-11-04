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
import { authorize } from "../middleware/role.middleware";

const router = Router();

// All fee routes require authentication
router.use(protect);

// Admin and Accounts can create fee records
router.post("/", authorize("admin", "accounts"), createStudentFee);

// Only Admin and Accounts can view all students' fee records
router.get("/", authorize("admin", "accounts"), getAllStudentFees);

// Test route
router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Student Fee route is working",
  });
});

// Students can view only their own fees
router.get("/my-fees", authorize("student"), getMyStudentFees);

// Admin and Accounts can view a specific fee record
router.get("/:id", authorize("admin", "accounts"), getStudentFeeById);

// Admin and Accounts can update fee records
router.put("/:id", authorize("admin", "accounts"), updateStudentFee);

// Admin and Accounts can delete fee records
router.delete("/:id", authorize("admin", "accounts"), deleteStudentFee);

export default router;