import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectToMongoDB = async () => {
  mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
  });
};
