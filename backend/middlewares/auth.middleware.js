import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "You are not logged In" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ success: false, message: "Invalid token" });
    const user = await User.findById(decoded.userId);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in Protect Route middleware",
    });
  }
};
export const getCurrentUser = async (req, res) => {
  if (!req.user)
    return res.status(401).json({ success: false, message: "User not found" });
  return res.status(200).json({ success: true, content: req.user });
};
