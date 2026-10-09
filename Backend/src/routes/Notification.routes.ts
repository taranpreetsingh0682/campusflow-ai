import { Router } from "express";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/Notification.controller";

const router = Router();

router.post("/", createNotification);
router.get("/user/:userId", getUserNotifications);
router.patch("/:id/read", markNotificationAsRead);

export default router;