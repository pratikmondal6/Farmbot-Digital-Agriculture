const express = require("express");
const router = express.Router();
const { Farmbot } =  require("farmbot");
const WateringJob = require("../models/watering"); // adjust path as needed
const { Seed: SeedingJob } = require("../models/seed");

// console.log("wateringJob.js loaded");

// GET all watering jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await WateringJob.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new watering job
router.post("/", async (req, res) => {
  console.log("Received POST /api/watering:", req.body);
  try {
    const { plantTypes, waterAmounts, z, date, interval } = req.body;
    // Get x/y for each plantType from SeedingJob
    const positions = await SeedingJob.find({ seed_name: { $in: plantTypes } });
    const jobs = positions.map(plant => ({
      plantType: plant.seed_name,
      x: plant.x,
      y: plant.y,
      z,
      waterAmount: waterAmounts[plant.seed_name],
      date,
      interval,
    }));
    const created = await WateringJob.insertMany(jobs);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a watering job
router.put("/:id", async (req, res) => {
  try {
    const updated = await WateringJob.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          plantType: req.body.plantTypes[0], // or handle multiple if needed
          waterAmount: req.body.waterAmounts[req.body.plantTypes[0]],
          z: req.body.z,
          date: req.body.date,
          interval: req.body.interval,
        }
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a watering job
router.delete("/:id", async (req, res) => {
  try {
    await WateringJob.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route
router.get('/test-unique', (req, res) => res.send('Unique test route working'));
router.get('/', (req, res) => res.send('Watering root working'));

module.exports = router;
