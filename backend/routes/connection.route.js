import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getConnectionStatus,
  getUserConnections,
  removeConnection,
} from "../controller/connection.controller.js";

const router = express.Router();
router.post("/request/:userId", protectRoute, sendConnectionRequest);
router.put("/accept/:requestId", protectRoute, acceptConnectionRequest);
router.put("/reject/:requestId", protectRoute, rejectConnectionRequest);
// Get all connection requests for the current user
router.get("/requests", protectRoute, getConnectionRequests);
// Get all connections for a user
router.get("/", protectRoute, getUserConnections);
router.delete("/:userId", protectRoute, removeConnection);
router.get("/status/:userId", protectRoute, getConnectionStatus);

export { router as connectionRouter };
