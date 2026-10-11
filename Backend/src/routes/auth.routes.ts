
import { Router } from "express";
import {
  register,
  loginUser,
  googleLogin,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", loginUser);
router.post("/google", googleLogin);

export default router;
