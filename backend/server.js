import express from "express";
import { connectToMongoDB } from "./utils/mongodbConnect.js";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.route.js";
import { postRouter } from "./routes/post.route.js";
import { notificationRouter } from "./routes/notification.route.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/notifications", notificationRouter);
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
  connectToMongoDB();
});
