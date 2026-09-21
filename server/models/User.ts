import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "shopkeeper" | "admin";
  isVerified: boolean;
  rewardPoints: number;
  verifiedDoc?: {
    type: string;
    number: string;
    name: string;
    dob: string;
    expiry: string;
    category: string;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({ _id: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ["customer", "shopkeeper", "admin"], default: "customer" },
  isVerified: { type: Boolean, default: false },
  rewardPoints: { type: Number, default: 0 },
  verifiedDoc: {
    type: { type: String },
    number: { type: String },
    name: { type: String },
    dob: { type: String },
    expiry: { type: String },
    category: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>("User", UserSchema);
