import express from "express";
import { connectToMongoDB } from "./utils/mongodbConnect.js";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.route.js";
dotenv.config();
const app = express();

app.use("/api/v1/auth", authRouter);
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
  connectToMongoDB();
});
