import { Router } from "express";

import {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/Attendance.controller";

const router = Router();

router.post("/", createAttendance);

router.get("/", getAllAttendance);

router.get(
  "/student/:studentId",
  getStudentAttendance
);

router.get("/:id", getAttendanceById);

router.put("/:id", updateAttendance);

router.delete("/:id", deleteAttendance);

export default router;