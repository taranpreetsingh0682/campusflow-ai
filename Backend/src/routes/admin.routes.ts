import {Router} from "express";

import {adminDashboard} from "../controllers/admin.controller";

import {protect} from "../middleware/auth.middleware";

import {authorize} from "../middleware/role.middleware";

const router=Router();

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  adminDashboard

);
export default router;