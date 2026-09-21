import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ridehub";
    await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to ${mongoUri}`);
  } catch (error) {
    console.error("[MongoDB] Connection failed", error);
    process.exit(1);
  }
};
