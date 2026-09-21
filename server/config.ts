import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "http://localhost:5173",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  // Default to mock mode if GEMINI_API_KEY is not set or AI_MODE is mock
  aiMode: (process.env.AI_MODE || (process.env.GEMINI_API_KEY ? "live" : "mock")) as "live" | "mock",
  maxImages: parseInt(process.env.MAX_IMAGES || "6", 10),
  maxImageMb: parseInt(process.env.MAX_IMAGE_MB || "5", 10),
  damageConfidenceMin: parseFloat(process.env.DAMAGE_CONFIDENCE_MIN || "0.6"),
};
