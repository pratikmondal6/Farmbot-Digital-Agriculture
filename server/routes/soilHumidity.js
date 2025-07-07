const express = require("express");
const router = express.Router();
const { Farmbot } = require("farmbot");
const mongoose = require("mongoose");

// Define the SoilHumidity model schema
const soilHumiditySchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create the SoilHumidity model if it doesn't exist
const SoilHumidity = mongoose.models.SoilHumidity || mongoose.model("SoilHumidity", soilHumiditySchema);

// GET all soil humidity records
router.get("/", async (req, res) => {
  try {
    const records = await SoilHumidity.find().sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check soil humidity at a specific location
router.post("/check", async (req, res) => {
  console.log("Received POST /api/soilHumidity/check:", req.body);
  try {
    const { x, y, z } = req.body;

    // Validate coordinates
    if (x === undefined || y === undefined || z === undefined) {
      return res.status(400).json({ message: "Coordinates (x, y, z) are required." });
    }

    // Simulate reading from soil humidity sensor
    // In a real implementation, this would communicate with the farmbot to get the actual reading
    const humidity = Math.floor(Math.random() * 41) + 30; // Random value between 30-70%

    // Create a new soil humidity record
    const newRecord = new SoilHumidity({
      x,
      y,
      z,
      humidity
    });

    // Save the record to the database
    await newRecord.save();

    // Return the humidity data
    res.status(200).json({
      x,
      y,
      z,
      humidity,
      timestamp: newRecord.timestamp
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a specific soil humidity record by ID
router.get("/:id", async (req, res) => {
  try {
    const record = await SoilHumidity.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Soil humidity record not found" });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a soil humidity record
router.delete("/:id", async (req, res) => {
  try {
    const record = await SoilHumidity.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Soil humidity record not found" });
    }
    res.json({ message: "Soil humidity record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;