import {Router} from "express";

import {
  createStudentFee,
  getAllStudentFees,
  updateStudentFee,
  deleteStudentFee,

} from "../controllers/StudentFee.controller";

const router = Router();
router.post("/",createStudentFee);
router.get("/",getAllStudentFees);
router.get("/:id",updateStudentFee);
router.put("/:id",updateStudentFee);
router.delete("/:id",deleteStudentFee);

export default router;
