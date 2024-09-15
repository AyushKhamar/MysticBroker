import express from "express";
import { login, logout, signup } from "../controller/auth.controller.js";
import {
  protectRoute,
  getCurrentUser,
} from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);

router.get("/me", protectRoute, getCurrentUser);

export { router as authRouter };
