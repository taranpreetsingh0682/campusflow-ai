
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

// Admin/HOD attendance management.
router.get("/", authorize("admin", "hod"), getAllAttendance);

router.get(
  "/student/:studentId",
  authorize("admin", "hod"),
  getStudentAttendance
);

router.get("/:id", authorize("admin", "hod"), getAttendanceById);

router.post("/", authorize("admin", "hod", "faculty"), createAttendance);

router.put("/:id", authorize("admin", "hod"), updateAttendance);

router.delete("/:id", authorize("admin", "hod"), deleteAttendance);

export default router;
