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
  if (valueType === "depth" && (value > 0 || value < -40)) {
    return res.status(400).json({ error: "Depth must be between 0 mm and -40 mm." });
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

  // Validation: plant_type must be provided and not empty
  if (!plant_type || typeof plant_type !== "string" || plant_type.trim() === "") {
    return res.status(400).json({ error: "plant_type is required and must be a non-empty string." });
  }
  // Validation: minimal_distance and seeding_depth must be numbers if provided
  if (typeof minimal_distance !== "number" || minimal_distance < 0) {
    return res.status(400).json({ error: "minimal_distance must be a non-negative number." });
  }
  if (typeof seeding_depth !== "number" || seeding_depth > 0 || seeding_depth < -40) {
    return res.status(400).json({ error: "seeding_depth must be between 0 mm and -40 mm." });
  }

  // Check for duplicate plant_type
  const existing = await Plant.findOne({ plant_type });
  if (existing) {
    return res.status(409).json({ error: "Plant type already exists." });
  }

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
  if (typeof depth !== "number" || depth > 0 || depth < -40) {
    return res.status(400).json({ error: "Depth must be a number between 0 mm and -40 mm." });
  }
  try {
    const plant = await Plant.findOneAndUpdate(
      { plant_type: plantType },
      { seeding_depth: depth },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: 'Seeding depth saved', plant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save seeding depth' });
  }
});

// Send seeding depth to FarmBot
router.post('/send-depth-to-farmbot', async (req, res) => {
  const { depth } = req.body;
  // Validate depth
  if (typeof depth !== "number" || depth > 0 || depth < -40) {
    return res.status(400).json({ error: "Depth must be a number between 0 mm and -40 mm." });
  }
  const bot = new Farmbot({ token: process.env.FARMBOT_TOKEN });
  try {
    await bot.connect();
    await bot.moveAbsolute({ x: 0, y: 0, z: Number(depth) });
    res.status(200).json({ message: 'Depth sent to FarmBot' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send depth to FarmBot' });
  }
});

module.exports = router;