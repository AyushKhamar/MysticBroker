import express from "express";
import { connectToMongoDB } from "./utils/mongodbConnect.js";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.route.js";
import { postRouter } from "./routes/post.route.js";
import { notificationRouter } from "./routes/notification.route.js";
import { connectionRouter } from "./routes/connection.route.js";
import cors from "cors";
import path from "path";
dotenv.config();
const app = express();
const __dirname = path.resolve();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
}

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/connections", connectionRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
  connectToMongoDB();
});
