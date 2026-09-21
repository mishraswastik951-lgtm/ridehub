import mongoose, { Schema, Document } from "mongoose";

export interface IInspection extends Document {
  bookingId: string;
  type: "pickup" | "return";
  photos: {
    angle: string;
    url: string;
    quality: string;
  }[];
  aiAnalysisResult?: any;
  status: "pending" | "analyzed" | "disputed" | "approved";
  createdAt: Date;
}

const InspectionSchema = new Schema<IInspection>({ _id: { type: String, required: true },
  bookingId: { type: String, ref: "Booking", required: true },
  type: { type: String, enum: ["pickup", "return"], required: true },
  photos: [{
    angle: { type: String, required: true },
    url: { type: String, required: true },
    quality: { type: String, default: "good" }
  }],
  aiAnalysisResult: { type: Schema.Types.Mixed },
  status: { type: String, enum: ["pending", "analyzed", "disputed", "approved"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export const Inspection = mongoose.model<IInspection>("Inspection", InspectionSchema);
