import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
dotenv.config();
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const passwordMatch = bcrypt.compare(password, userExists.password);
    if (!passwordMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    const token = jwt.sign({ userId: userExists._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    setCookie(res, token);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      content: userExists,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in Login controller",
    });
  }
};
export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error in Logout controller",
    });
  }
};
export const signup = async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    setCookie(res, token);
    const profileUrl = process.env.CLIENT_URL + "/profile/" + newUser.username;
    try {
      await sendWelcomeEmail(newUser.email, newUser.name, profileUrl);
    } catch (error) {
      console.log(error);
    }
    return res
      .status(201)
      .json({ success: true, message: "User created", content: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error in Signup controller",
    });
  }
};

const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false, // set secure to true in production
    sameSite: "strict", // set sameSite to none in production
    maxAge: 3 * 24 * 60 * 60 * 1000, // expires in 30 days
  });
};
