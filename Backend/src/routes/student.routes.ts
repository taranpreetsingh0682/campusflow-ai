import {Router} from "express";
import { getStudentProfile } from "../controllers/student.controller";
import { protect } from "../middleware/auth.middleware";

const router =Router();
router.get("/:id",protect,getStudentProfile);
export default router;