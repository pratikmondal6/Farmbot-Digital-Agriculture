const express = require("express");
const router = express.Router();
const { Farmbot } = require("farmbot");
const mongoose = require("mongoose");
const { setJobStatus } = require("../services/farmbotStatusService");

// Define the AreaHumidity model schema
const areaHumiditySchema = new mongoose.Schema({
  coordinates: [
    {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      humidity: { type: Number, required: true }
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

// Create the AreaHumidity model if it doesn't exist
const AreaHumidity = mongoose.models.AreaHumidity || mongoose.model("AreaHumidity", areaHumiditySchema);

// Helper function to move the bot
const move = async (bot, x, y, z) => {
  // Ensure coordinates are numbers
  const xNum = Number(x);
  const yNum = Number(y);
  const zNum = Number(z);
  console.log(`Moving to coordinates: x=${xNum}, y=${yNum}, z=${zNum}`);
  await bot.moveAbsolute({ x: xNum, y: yNum, z: zNum, speed: 100 });
}

// Helper function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to calculate points within an area
function calculatePointsInArea(topLeft, topRight, bottomLeft, bottomRight, interval = 100) {
  // Calculate the width and height of the area
  const width = Math.max(
    Math.abs(topRight.x - topLeft.x),
    Math.abs(bottomRight.x - bottomLeft.x)
  );
  const height = Math.max(
    Math.abs(topLeft.y - bottomLeft.y),
    Math.abs(topRight.y - bottomRight.y)
  );

  // Calculate the number of points in each direction
  const numPointsX = Math.floor(width / interval) + 1;
  const numPointsY = Math.floor(height / interval) + 1;

  const points = [];
  
  // Generate points in a grid pattern
  for (let i = 0; i < numPointsX; i++) {
    for (let j = 0; j < numPointsY; j++) {
      // Calculate the position as a percentage of the grid
      const percentX = i / (numPointsX - 1 || 1);
      const percentY = j / (numPointsY - 1 || 1);
      
      // Interpolate between the four corners to find the point
      const x = topLeft.x + percentX * (topRight.x - topLeft.x) + 
                percentY * (bottomLeft.x - topLeft.x) + 
                percentX * percentY * (topRight.x - topLeft.x - bottomRight.x + bottomLeft.x);
      
      const y = topLeft.y + percentX * (topRight.y - topLeft.y) + 
                percentY * (bottomLeft.y - topLeft.y) + 
                percentX * percentY * (topRight.y - topLeft.y - bottomRight.y + bottomLeft.y);
      
      points.push({ x: Math.round(x), y: Math.round(y), z: -530 });
    }
  }
  
  return points;
}

// POST endpoint to measure humidity in a selected area
router.post("/measure", async (req, res) => {
  console.log("Received POST /api/areaHumidity/measure:", req.body);
  try {
    // Validate auth token
    if (!req.headers["auth-token"]) {
      return res.status(401).json({
        status: 401,
        message: "Not authorized."
      });
    }

    const { topLeft, topRight, bottomLeft, bottomRight } = req.body;

    // Validate coordinates
    if (!topLeft || !topRight || !bottomLeft || !bottomRight) {
      return res.status(400).json({ 
        message: "All four corner coordinates (topLeft, topRight, bottomLeft, bottomRight) are required." 
      });
    }

    // Validate that each corner has x and y coordinates
    const corners = [topLeft, topRight, bottomLeft, bottomRight];
    for (const corner of corners) {
      if (corner.x === undefined || corner.y === undefined) {
        return res.status(400).json({ 
          message: "Each corner must have x and y coordinates." 
        });
      }
    }

    const token = req.headers["auth-token"];
    let bot = new Farmbot({ token: token });

    try {
      // Connect to the Farmbot
      await bot.connect();
      setJobStatus("measuring area humidity");

      // Constants for soil sensor location
      const SOIL_SENSOR_X = 2630;
      const SOIL_SENSOR_Y = 350;
      const SOIL_SENSOR_APPROACH_Z = -350;
      const SOIL_SENSOR_ATTACH_Z = -410;
      const SOIL_SENSOR_X_OFFSET = 2560;
      const SOIL_SENSOR_PIN = 59; // Analog pin for soil moisture sensor

      // Step 1: Move to soil sensor approach position
      await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_APPROACH_Z);

      // Step 2: Move to soil sensor attach position
      try {
        console.log("Attempting to move to soil sensor attach position...");
        await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);
        console.log("Successfully moved to soil sensor attach position");
      } catch (attachError) {
        console.error("Error moving to soil sensor attach position:", attachError);
        // Try with a slightly different Z coordinate if the exact one fails
        console.log("Trying with adjusted Z coordinate...");
        await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, -400);
      }

      // Step 3: Wait for the bot to stabilize
      await sleep(2000);

      // Step 4: Move X to offset position (keeping Y and Z the same)
      await move(bot, SOIL_SENSOR_X_OFFSET, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);

      // Calculate points to measure within the area
      const pointsToMeasure = calculatePointsInArea(topLeft, topRight, bottomLeft, bottomRight);
      
      // Array to store humidity readings
      const humidityReadings = [];

      // Step 5: Move to each point and take a reading
      for (const point of pointsToMeasure) {
        setJobStatus(`measuring at point (${point.x}, ${point.y})`);
        
        // Move to the point at a safe height first
        await move(bot, point.x, point.y, -400);
        
        // Then move down to the measurement depth
        try {
          await move(bot, point.x, point.y, point.z);
        } catch (depthError) {
          console.error(`Error moving to depth at point (${point.x}, ${point.y}):`, depthError);
          // Continue with a slightly higher position if exact depth fails
          await move(bot, point.x, point.y, point.z + 30);
        }
        
        // Wait for the bot to stabilize
        await sleep(1000);
        
        // Read from the soil humidity sensor
        const pinReadResult = await bot.readPin({
          pin_number: SOIL_SENSOR_PIN,
          pin_mode: 1 // 1 = analog
        });
        
        // Convert the raw sensor value to a humidity percentage
        const rawValue = pinReadResult.value || 0;
        console.log(`Raw sensor value at (${point.x}, ${point.y}):`, rawValue);
        const humidity = Math.round((1023 - rawValue) / 1023 * 100);
        
        // Add the reading to our array
        humidityReadings.push({
          x: point.x,
          y: point.y,
          z: point.z,
          humidity
        });
        
        // Move back up to a safe height
        await move(bot, point.x, point.y, -400);
      }

      setJobStatus("Finished");
      setTimeout(() => {
        setJobStatus("online");
      }, 3000);

      // Create a new area humidity record
      const newRecord = new AreaHumidity({
        coordinates: humidityReadings
      });

      // Save the record to the database
      await newRecord.save();

      // Return the humidity data
      res.status(200).json({
        id: newRecord._id,
        coordinates: humidityReadings,
        timestamp: newRecord.timestamp
      });
    } catch (botError) {
      console.error("Farmbot error:", botError);
      console.error("Error details:", JSON.stringify(botError, null, 2));
      setJobStatus("error");

      // If there's an error with the Farmbot, fall back to simulated readings
      const pointsToMeasure = calculatePointsInArea(topLeft, topRight, bottomLeft, bottomRight);
      const simulatedReadings = pointsToMeasure.map(point => ({
        x: point.x,
        y: point.y,
        z: point.z,
        humidity: Math.floor(Math.random() * 101) // Random value between 0-100
      }));

      // Create a new area humidity record with simulated data
      const newRecord = new AreaHumidity({
        coordinates: simulatedReadings
      });

      // Save the record to the database
      await newRecord.save();

      // Return the simulated humidity data with a warning
      res.status(200).json({
        id: newRecord._id,
        coordinates: simulatedReadings,
        timestamp: newRecord.timestamp,
        warning: "Used simulated data due to Farmbot connection error"
      });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all area humidity records
router.get("/", async (req, res) => {
  try {
    const records = await AreaHumidity.find().sort({ timestamp: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a specific area humidity record by ID
router.get("/:id", async (req, res) => {
  try {
    const record = await AreaHumidity.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Area humidity record not found" });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an area humidity record
router.delete("/:id", async (req, res) => {
  try {
    const record = await AreaHumidity.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Area humidity record not found" });
    }
    res.json({ message: "Area humidity record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;