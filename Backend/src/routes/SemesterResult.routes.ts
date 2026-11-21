
import { Router } from "express";
import {
  saveStudentResults,
  getMySemesterResults,
} from "../controllers/SemesterResult.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(protect);

// Student can see only their own results
router.get(
  "/my-results",
  authorize("student"),
  getMySemesterResults
);

// Admin/developer can add or update results
router.post(
  "/",
  authorize("admin", "developer", "hod"),
  saveStudentResults
);

export default router;
