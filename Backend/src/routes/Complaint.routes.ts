import { Router } from "express";
import {
  createComplaint,
  getAllComplaints,
  getStudentComplaints,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
} from "../controllers/Complaint.controller";

const router = Router();

router.post("/", createComplaint);
router.get("/", getAllComplaints);
router.get("/student/:studentId", getStudentComplaints);
router.patch("/:id/assign", assignComplaint);
router.patch("/:id/status", updateComplaintStatus);
router.delete("/:id", deleteComplaint);

export default router;