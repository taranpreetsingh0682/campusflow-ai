
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

// Require authentication for every attendance route
router.use(protect);

// Read attendance records
router.get(
  "/",
  authorize("admin", "hod"),
  getAllAttendance
);

router.get(
  "/student/:studentId",
  authorize("admin", "hod"),
  getStudentAttendance
);

router.get(
  "/:id",
  authorize("admin", "hod"),
  getAttendanceById
);

// Create, update, and delete attendance
router.post(
  "/",
  authorize("admin", "hod"),
  createAttendance
);

router.put(
  "/:id",
  authorize("admin", "hod"),
  updateAttendance
);

router.delete(
  "/:id",
  authorize("admin", "hod"),
  deleteAttendance
);

export default router;
