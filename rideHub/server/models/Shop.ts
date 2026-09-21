import mongoose, { Schema, Document } from "mongoose";

export interface IShop extends Document {
  ownerId: string;
  name: string;
  address: string;
  city: string;
  location: {
    lat: number;
    lng: number;
  };
  isHubX: boolean;
  hubxTier: "trial" | "monthly" | "half_yearly" | "yearly";
  trustScore: number;
  trustBreakdown: {
    honesty: number;
    condition: number;
    punctuality: number;
    communication: number;
  };
}

const ShopSchema = new Schema<IShop>({ _id: { type: String, required: true },
  ownerId: { type: String, ref: "User", required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: "Bengaluru" },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  isHubX: { type: Boolean, default: true },
  hubxTier: { type: String, enum: ["trial", "monthly", "half_yearly", "yearly"], default: "trial" },
  trustScore: { type: Number, default: 4.8 },
  trustBreakdown: {
    honesty: { type: Number, default: 99.2 },
    condition: { type: Number, default: 97.5 },
    punctuality: { type: Number, default: 98.4 },
    communication: { type: Number, default: 99.0 }
  }
});

export const Shop = mongoose.model<IShop>("Shop", ShopSchema);
