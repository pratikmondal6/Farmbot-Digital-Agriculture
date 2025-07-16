const express = require("express");
const router = express.Router();
const { Farmbot } =  require("farmbot");
const WateringJob = require("../models/watering"); // adjust path as needed
const { Seed } = require("../models/seed");
const { setJobStatus } = require("../services/farmbotStatusService");
const { findShortestPath } = require("../services/findShortestPath")


const move = async (bot, x, y, z) => {
  await bot.moveAbsolute({ x: x, y: y, z: z, speed: 100 });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mlToMS = (ml) => {
  return ml * 10
}

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
    const { plantType, waterAmount, waterUnit, z, date, interval } = req.body; // <-- add waterUnit

    // 1. Check: First execution is not in the past
    const now = new Date();
    const requestedDate = new Date(date);
    if (requestedDate < now) {
      return res.status(400).json({ message: "First execution cannot be in the past." });
    }

    // 2. Check: No other job exists for the same plant type at the same time
    const alreadyScheduled = await WateringJob.findOne({ plantType, date: requestedDate });
    if (alreadyScheduled) {
      return res.status(400).json({ message: `Plant type "${plantType}" already has a watering job scheduled at this time.` });
    }

    // 3. Create only one job for the plant type
    const job = new WateringJob({
      plantType,
      waterAmount,
      waterUnit, // <-- save unit
      z,
      date: requestedDate,
      interval,
      lastWateredDate: ""
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start a watering job
router.post("/start", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  if (req.body.plantType === undefined, req.body.waterAmount === undefined) {
    return res.status(500).send({
      "status": 500,
      "message": "Plant type or watering amount is not sent in body"
    })
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });
  await bot.connect()

  const plantType = req.body.plantType
  const waterAmount = parseInt(req.body.waterAmount)

  let seedsToWater = await Seed.find({seed_name: plantType});
  seedsToWater = findShortestPath(seedsToWater);
  console.log("Seeds to water:")
  console.log(seedsToWater)

  if (!seedsToWater) {
    return res.status(500).send({
      "message": "No seed with fiven plant type found!"
    })
  }

  setJobStatus("moving to watering nuzzle");

  // Go a little outside and upper than watering nuzzle
  await move(bot, x=2500, y=150, z=-395)

  // Go to higher than watering nuzzle
  await move(bot, x=2630, y=150, z=-395)

  // Go down to get watering nuzzle
  await move(bot, x=2630, y=150, z=-410)

  // Go a little outside to take it out
  await move(bot, x=2500, y=150, z=-410)

  for (let seedToWater of seedsToWater) {
    seedX = parseInt(seedToWater.x)
    seedY = parseInt(seedToWater.y)

    setJobStatus("moving to seed");

    // Go to a little higher from seed (x=2130, y=25)
    await move(bot, x=seedX, y=seedY, z=-480)

    setJobStatus("watering");

    // Turn on water (usually pin 8 for standard kits)
    await bot.writePin({
      pin_number: 8,
      pin_value: 1,    // 1 = watering on, 0 = watering off
      pin_mode: 0      // 0 = digital, 1 = analog
    });

    await sleep(mlToMS(waterAmount))

    // Turn off water
    await bot.writePin({
      pin_number: 8,
      pin_value: 0,    // 1 = watering on, 0 = watering off
      pin_mode: 0      // 0 = digital, 1 = analog
    });
  }

  setJobStatus("putting back watering nuzzle");

  // Go to left of watering nuzzle
  await move(bot, x=2500, y=150, z=-410)

  // Go to watering nuzzle
  await move(bot, x=2630, y=150, z=-410)

  // Go up to release it
  await move(bot, x=2630, y=150, z=-395)

  setJobStatus("Finished");

  setTimeout(() => {
    setJobStatus("online");
  }, 3000);

  res.status(200).send({
    "message": "Watering seeds is done successfully"
  })
});

// UPDATE a watering job
router.put("/:id", async (req, res) => {
  try {
    const updated = await WateringJob.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          plantType: req.body.plantType,
          waterAmount: req.body.waterAmount,
          waterUnit: req.body.waterUnit, // <-- save unit
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
