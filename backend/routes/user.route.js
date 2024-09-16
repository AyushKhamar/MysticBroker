import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getPublicProfile,
  getSuggestedConnections,
  updateProfile,
} from "../controller/user.controller.js";

const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile);
router.put("/:username", protectRoute, updateProfile);

export { router as userRouter };
