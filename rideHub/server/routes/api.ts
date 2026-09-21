import express from "express";
import { User } from "../models/User.js";
import { Shop } from "../models/Shop.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
import { Inspection } from "../models/Inspection.js";

export const apiRouter = express.Router();

import { triggerBookingAiAnalysis, triggerVehicleAiAnalysis } from "../services/aiPipeline.js";

// ---- USERS ----
apiRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

apiRouter.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
});

// ---- SHOPS ----
apiRouter.get("/shops", async (req, res) => {
  try {
    const shops = await Shop.find().populate("ownerId");
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

apiRouter.post("/shops", async (req, res) => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json(shop);
  } catch (err) {
    res.status(400).json({ error: "Failed to create shop" });
  }
});

// ---- VEHICLES ----
apiRouter.get("/vehicles", async (req, res) => {
  try {
    const { shopId, category } = req.query;
    const filter: any = {};
    if (shopId) filter.shopId = shopId;
    if (category) filter.category = category;
    
    const vehicles = await Vehicle.find(filter).populate("shopId");
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

apiRouter.post("/vehicles", async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: "Failed to create vehicle" });
  }
});

apiRouter.patch("/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (vehicle) triggerVehicleAiAnalysis(vehicle);
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: "Failed to update vehicle" });
  }
});

// ---- BOOKINGS ----
apiRouter.get("/bookings", async (req, res) => {
  try {
    const { userId, shopId, status } = req.query;
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (shopId) filter.shopId = shopId;
    if (status) filter.rentalStatus = status;

    const bookings = await Booking.find(filter)
      .populate("userId")
      .populate("vehicleId")
      .populate("shopId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

apiRouter.post("/bookings", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    triggerBookingAiAnalysis(booking);
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: "Failed to create booking" });
  }
});

apiRouter.patch("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: "Failed to update booking" });
  }
});

// ---- INSPECTIONS ----
apiRouter.get("/inspections", async (req, res) => {
  try {
    const { bookingId } = req.query;
    const filter = bookingId ? { bookingId } : {};
    const inspections = await Inspection.find(filter).populate("bookingId");
    res.json(inspections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inspections" });
  }
});

apiRouter.post("/inspections", async (req, res) => {
  try {
    const inspection = await Inspection.create(req.body);
    res.status(201).json(inspection);
  } catch (err) {
    res.status(400).json({ error: "Failed to create inspection" });
  }
});
