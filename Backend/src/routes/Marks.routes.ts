
import { Router } from "express";

import {
  createMarks,
  getAllMarks,
  getMarksById,
  getStudentMarks,
  getMyStudentMarks,
  updateMarks,
  deleteMarks,
} from "../controllers/Marks.controller";

import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// All routes require authentication
router.use(protect);

// Student can access only their own results
// Keep this route before /:id
router.get(
  "/my-results",
  authorize("student"),
  getMyStudentMarks
);

// Admin and HOD routes
router.get(
  "/",
  authorize("admin", "hod"),
  getAllMarks
);

router.get(
  "/student/:studentId",
  authorize("admin", "hod"),
  getStudentMarks
);

router.get(
  "/:id",
  authorize("admin", "hod"),
  getMarksById
);

router.post(
  "/",
  authorize("admin", "hod"),
  createMarks
);

router.put(
  "/:id",
  authorize("admin", "hod"),
  updateMarks
);

router.delete(
  "/:id",
  authorize("admin", "hod"),
  deleteMarks
);

export default router;
