import { Router } from "express";

import {
  createStudentFee,
  getAllStudentFees,
  getStudentFeeById,
  updateStudentFee,
  deleteStudentFee,
} from "../controllers/StudentFee.controller";

const router = Router();

router.post("/", createStudentFee);

router.get("/", getAllStudentFees);

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Student Fee route is working",
  });
});

router.get("/:id", getStudentFeeById);

router.put("/:id", updateStudentFee);

router.delete("/:id", deleteStudentFee);

export default router;