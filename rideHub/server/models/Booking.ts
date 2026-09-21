import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: string;
  vehicleId: string;
  shopId: string;
  startTime: Date;
  endTime: Date;
  totalDays: number;
  basePrice: number;
  dynamicAdjustment: number;
  surgeReasons?: string;
  securityDeposit: number;
  taxesAndGst: number;
  pointsDiscount: number;
  finalAmount: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  rentalStatus: "upcoming" | "active" | "extended" | "completed" | "cancelled";
  refundAmount: number;
  agreementSignedAt?: Date;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({ _id: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  vehicleId: { type: String, ref: "Vehicle", required: true },
  shopId: { type: String, ref: "Shop", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  dynamicAdjustment: { type: Number, default: 0 },
  surgeReasons: { type: String },
  securityDeposit: { type: Number, required: true },
  taxesAndGst: { type: Number, required: true },
  pointsDiscount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "completed" },
  rentalStatus: { type: String, enum: ["upcoming", "active", "extended", "completed", "cancelled"], default: "upcoming" },
  refundAmount: { type: Number, default: 0 },
  agreementSignedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
