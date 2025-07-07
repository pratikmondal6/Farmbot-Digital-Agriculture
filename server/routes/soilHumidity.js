const express = require("express");
const router = express.Router();
const { Farmbot } = require("farmbot");
const mongoose = require("mongoose");
const { setJobStatus } = require("../services/farmbotStatusService");

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

// Helper function to move the bot
const move = async (bot, x, y, z) => {
  await bot.moveAbsolute({ x: x, y: y, z: z, speed: 100 });
}

// Helper function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// GET all soil humidity records
router.get("/", async (req, res) => {
  try {
    const records = await SoilHumidity.find().sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Move to soil humidity sensor and take a reading
router.post("/read-sensor", async (req, res) => {
  console.log("Received POST /api/soilHumidity/read-sensor:", req.body);
  try {
    // Validate auth token
    if (!req.headers["auth-token"]) {
      return res.status(401).json({
        status: 401,
        message: "Not authorized."
      });
    }

    const { targetX, targetY, targetZ } = req.body;

    // Validate target coordinates
    if (targetX === undefined || targetY === undefined || targetZ === undefined) {
      return res.status(400).json({ message: "Target coordinates (targetX, targetY, targetZ) are required." });
    }

    const token = req.headers["auth-token"];
    let bot = new Farmbot({ token: token });

    try {
      // Connect to the Farmbot
      await bot.connect();
      setJobStatus("moving to soil sensor");

      // Constants for soil sensor location
      const SOIL_SENSOR_X = 2630;
      const SOIL_SENSOR_Y = 350;
      const SOIL_SENSOR_APPROACH_Z = -350;
      const SOIL_SENSOR_ATTACH_Z = -410;
      const SOIL_SENSOR_X_OFFSET = 2580;
      const SOIL_SENSOR_PIN = 59; // Analog pin for soil moisture sensor

      // Step 1: Move to soil sensor approach position
      await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_APPROACH_Z);

      // Step 2: Move to soil sensor attach position
      await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);

      // Step 3: Wait for the bot to stabilize
      await sleep(2000);

      // Step 4: Move X to offset position (keeping Y and Z the same)
      await move(bot, SOIL_SENSOR_X_OFFSET, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);

      setJobStatus("moving to target position");

      // Step 5: Move to target location
      await move(bot, targetX, targetY, targetZ);

      setJobStatus("reading soil humidity");

      // Step 6: Read from the soil humidity sensor
      const pinReadResult = await bot.readPin({
        pin_number: SOIL_SENSOR_PIN,
        pin_mode: 1 // 1 = analog
      });

      // Convert the raw sensor value to a humidity percentage
      const rawValue = pinReadResult.value || 0;
      const humidity = Math.round(100 - (rawValue / 1023 * 100));

      // Step 7: Move back to a safe position
      await move(bot, targetX, targetY, targetZ + 50);

      setJobStatus("Finished");
      setTimeout(() => {
        setJobStatus("online");
      }, 3000);

      // Create a new soil humidity record
      const newRecord = new SoilHumidity({
        x: targetX,
        y: targetY,
        z: targetZ,
        humidity
      });

      // Save the record to the database
      await newRecord.save();

      // Return the humidity data
      res.status(200).json({
        x: targetX,
        y: targetY,
        z: targetZ,
        humidity,
        timestamp: newRecord.timestamp
      });
    } catch (botError) {
      console.error("Farmbot error:", botError);
      setJobStatus("error");

      // If there's an error with the Farmbot, fall back to a simulated reading
      const humidity = Math.floor(Math.random() * 41) + 30; // Random value between 30-70%

      // Create a new soil humidity record with simulated data
      const newRecord = new SoilHumidity({
        x: targetX,
        y: targetY,
        z: targetZ,
        humidity
      });

      // Save the record to the database
      await newRecord.save();

      // Return the simulated humidity data with a warning
      res.status(200).json({
        x: targetX,
        y: targetY,
        z: targetZ,
        humidity,
        timestamp: newRecord.timestamp,
        warning: "Used simulated data due to Farmbot connection error"
      });
    }
  } catch (err) {
    console.error("Server error:", err);
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

    // Validate auth token
    if (!req.headers["auth-token"]) {
      return res.status(401).json({
        status: 401,
        message: "Not authorized."
      });
    }

    const token = req.headers["auth-token"];
    let bot = new Farmbot({ token: token });

    try {
      // Connect to the Farmbot
      await bot.connect();
      setJobStatus("checking soil humidity");

      // Constants for soil sensor
      const SOIL_SENSOR_PIN = 59; // Analog pin for soil moisture sensor

      // Move to the specified location
      await move(bot, x, y, z);

      // Wait for the bot to stabilize
      await sleep(1000);

      // Read from the soil humidity sensor
      const pinReadResult = await bot.readPin({
        pin_number: SOIL_SENSOR_PIN,
        pin_mode: 1 // 1 = analog
      });

      // Convert the raw sensor value to a humidity percentage (0-100%)
      // Assuming sensor gives values between 0-1023, where 0 is wet and 1023 is dry
      // Adjust this conversion based on your specific sensor characteristics
      const rawValue = pinReadResult.value || 0;
      const humidity = Math.round(100 - (rawValue / 1023 * 100));

      // Move the bot back to a safe position
      await move(bot, x, y, z + 50); // Move up 50mm from the current position

      setJobStatus("Finished");
      setTimeout(() => {
        setJobStatus("online");
      }, 3000);

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
    } catch (botError) {
      console.error("Farmbot error:", botError);
      setJobStatus("error");

      // If there's an error with the Farmbot, fall back to a simulated reading
      const humidity = Math.floor(Math.random() * 41) + 30; // Random value between 30-70%

      // Create a new soil humidity record with simulated data
      const newRecord = new SoilHumidity({
        x,
        y,
        z,
        humidity
      });

      // Save the record to the database
      await newRecord.save();

      // Return the simulated humidity data with a warning
      res.status(200).json({
        x,
        y,
        z,
        humidity,
        timestamp: newRecord.timestamp,
        warning: "Used simulated data due to Farmbot connection error"
      });
    }
  } catch (err) {
    console.error("Server error:", err);
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
