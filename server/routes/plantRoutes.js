const express = require('express');
const router = express.Router();
const Plant = require('../models/plan.js'); 
const { Farmbot } = require("farmbot");
require('dotenv').config();

// Save minimal_distance or seeding_depth based on valueType
router.post('/save', async (req, res) => {
  const { plantType, valueType, value } = req.body;
  if (!plantType || !valueType || typeof value !== "number") {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }
  if (valueType === "depth" && (value < 5 || value > 40)) {
    return res.status(400).json({ error: "Depth must be between 5 and 40 mm." });
  }
  if (valueType === "distance" && (value < 50 || value > 1000)) {
    return res.status(400).json({ error: "Distance must be between 50 and 1000 mm." });
  }
  if (!["depth", "distance"].includes(valueType)) {
    return res.status(400).json({ error: "valueType must be 'depth' or 'distance'." });
  }

  // Build update object
  const update = {};
  if (valueType === "depth") update.seeding_depth = value;
  else if (valueType === "distance") update.minimal_distance = value;

  try {
    const plant = await Plant.findOneAndUpdate(
      { plant_type: plantType },
      update,
      { new: true, upsert: true }
    );
    res.status(201).json({ message: 'Saved successfully', plant });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Add a new plant type
router.post('/add-type', async (req, res) => {
  const { plant_type, minimal_distance = 0, seeding_depth = 0 } = req.body;
  try {
    const plan = new Plant({ plant_type, minimal_distance, seeding_depth });
    await plan.save();
    res.status(201).json({ message: 'Plant type added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add plant type' });
  }
});

// Get all plant types
router.get('/types', async (req, res) => {
  try {
    const plants = await Plant.find({}, 'plant_type');
    const plantTypes = plants.map(p => p.plant_type);
    res.json(plantTypes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plant types' });
  }
});

// Add or update minimum seed depth for a plant type
router.post('/save-depth', async (req, res) => {
  const { plantType, depth } = req.body;
  // Validate depth
  if (typeof depth !== "number" || depth < 5 || depth > 40) {
    return res.status(400).json({ error: "Depth must be a number between 5 and 40 mm." });
  }
  try {
    const plant = await Plant.findOneAndUpdate(
      { plant_type: plantType },
      { seeding_depth: depth },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: 'Seeding depth saved', plant });
  } catch (err) {
    console.error(err); // Add this line
    res.status(500).json({ error: 'Failed to save seeding depth' });
  }
});

// Send seeding depth to FarmBot
router.post('/send-depth-to-farmbot', async (req, res) => {
  const { depth } = req.body;
  // Validate depth
  if (typeof depth !== "number" || depth < 5 || depth > 40) {
    return res.status(400).json({ error: "Depth must be a number between 5 and 40 mm." });
  }
  const bot = new Farmbot({ token: process.env.FARMBOT_TOKEN });
  // console.log("FarmBot token:", process.env.FARMBOT_TOKEN);
  try {
    await bot.connect();
    await bot.moveAbsolute({ x: 0, y: 0, z: Number(depth) });
    res.status(200).json({ message: 'Depth sent to FarmBot' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send depth to FarmBot' });
  }
});

module.exports = router;