
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

// All fee routes require authentication.
router.use(protect);

// Admin, Developer and Accounts can create fee records.
router.post(
  "/",
  authorize("admin", "developer", "accounts"),
  createStudentFee
);

// Admin, Developer and Accounts can view all fee records.
router.get(
  "/",
  authorize("admin", "developer", "accounts"),
  getAllStudentFees
);

// Test route.
router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Student Fee route is working",
  });
});

// Students can view only their own fees.
router.get(
  "/my-fees",
  authorize("student"),
  getMyStudentFees
);

// Admin, Developer and Accounts can view a specific fee record.
router.get(
  "/:id",
  authorize("admin", "developer", "accounts"),
  getStudentFeeById
);

// Admin, Developer and Accounts can update fee records.
router.put(
  "/:id",
  authorize("admin", "developer", "accounts"),
  updateStudentFee
);

// Admin, Developer and Accounts can delete fee records.
router.delete(
  "/:id",
  authorize("admin", "developer", "accounts"),
  deleteStudentFee
);

export default router;
