import { Router } from "express";
import { getProfile } from "../controllers/profile.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", protect, getProfile);

export default router;