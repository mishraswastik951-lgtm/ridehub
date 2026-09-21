import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  shopId: string;
  name: string;
  category: "scooty" | "bike" | "car";
  brand: string;
  modelYear: number;
  transmission: string;
  fuelType: string;
  mileageKmpl: number;
  baseDailyPrice: number;
  securityDeposit: number;
  imageUrl: string;
  walkaroundVideoUrl?: string;
  isAvailable: boolean;
  locationName: string;
  rating: number;
  aiDynamicPriceTag?: string; // Automatically updated by Gemini auto-feed
}

const VehicleSchema = new Schema<IVehicle>({ _id: { type: String, required: true },
  shopId: { type: String, ref: "Shop", required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ["scooty", "bike", "car"], required: true },
  brand: { type: String, required: true },
  modelYear: { type: Number, required: true },
  transmission: { type: String, default: "Automatic" },
  fuelType: { type: String, default: "Petrol" },
  mileageKmpl: { type: Number, required: true },
  baseDailyPrice: { type: Number, required: true },
  securityDeposit: { type: Number, default: 1500 },
  imageUrl: { type: String, required: true },
  walkaroundVideoUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  locationName: { type: String, required: true },
  rating: { type: Number, default: 4.85 },
  aiDynamicPriceTag: { type: String }
});

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
