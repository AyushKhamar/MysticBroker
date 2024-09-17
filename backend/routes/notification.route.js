import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserNotifications);
router.put("/:id/read", protectRoute, markNotificationAsRead);
router.delete(":id", protectRoute, deleteNotification);

export { router as notificationRouter };
