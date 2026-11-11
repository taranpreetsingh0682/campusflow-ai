
import { Router } from "express";

import {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/Attendance.controller";

import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// All attendance routes require authentication.
router.use(protect);

// View all attendance.
router.get(
  "/",
  authorize("admin", "developer", "hod"),
  getAllAttendance
);

// View student attendance.
router.get(
  "/student/:studentId",
  authorize("admin", "developer", "hod", "student"),
  getStudentAttendance
);

// View attendance by ID.
router.get(
  "/:id",
  authorize("admin", "developer", "hod"),
  getAttendanceById
);

// Create attendance.
router.post(
  "/",
  authorize("admin", "developer", "hod", "faculty"),
  createAttendance
);

// Update attendance.
router.put(
  "/:id",
  authorize("admin", "developer", "hod"),
  updateAttendance
);

// Delete attendance.
router.delete(
  "/:id",
  authorize("admin", "developer", "hod"),
  deleteAttendance
);

export default router;
