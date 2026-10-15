
import { Router } from "express";
import {
  createMarks,
  getAllMarks,
  getMarksById,
  getStudentMarks,
  updateMarks,
  deleteMarks,
} from "../controllers/Marks.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Require authentication for every marks route
router.use(protect);

// Read marks records
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

// Create, update, and delete marks
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
