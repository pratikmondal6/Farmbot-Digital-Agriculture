const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const { Seed } = require("../models/seed");
const { FutureSeed } = require("../models/futureSeed");
const { SeedJob } = require("../models/seedingJob");
const { Farmbot } =  require("farmbot");
const Plant = require('../models/plan.js'); 
const { setJobStatus } = require("../services/farmbotStatusService");
const { generatePlantablePoints } = require("../services/generatePlantablePoints")
const axios = require("axios");

const move = async (bot, x, y, z) => {
  await bot.moveAbsolute({ x: x, y: y, z: z, speed: 100 });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start a seeding job
router.post("/start", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  // if (req.body.x === undefined || req.body.y === undefined) {
  //   return res.status(500).send({
  //     "status": 500,
  //     "message": "x and y is not sent in body"
  //   })
  // }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });
  await bot.connect()

  const seedX = parseInt(req.body.seedX)
  const seedY = parseInt(req.body.seedY)
  // const destX = parseInt(req.body.x)
  // const destY = parseInt(req.body.y)
  const depth = parseInt(req.body.z)

  let seedPoints = []
  if (req.body.seedPoints) {
    seedPoints = req.body.seedPoints
  }
  else {
    let plantDetails = await Plant.findOne({ plant_type: req.body.seed_name })
    seedPoints = await generatePlantablePoints(plantDetails, req.body.topLeft, req.body.bottomRight)
  }
  console.log("calculated points")
  console.log(seedPoints)

  if (seedPoints.length == 0) {
    return res.status(204).send({message: "No point is calculated"})
  }

  // Go a little outside and upper than seeding object
  await move(bot, x=2500, y=245, z=-395)

  // Go to higher than seeder object
  await move(bot, x=2630, y=245, z=-395)

  // Go down to get seeder object
  await move(bot, x=2630, y=245, z=-410)

  // Go a little outside to take it out
  await move(bot, x=2500, y=245, z=-410)

  for (let point of seedPoints) {

    // Go to a little higher from seed (x=2130, y=25)
    await move(bot, x=seedX, y=seedY, z=-480)

    setJobStatus("moving to seeding position");

    // Start suction
    await bot.writePin({
      pin_number: 9,
      pin_value: 1,          // 1 = ON (HIGH), 0 = OFF (LOW)
      pin_mode: 0            // 0 = digital, 1 = analog
    });

    // Go down to get seed
    await move(bot, x=seedX, y=seedY, z=-530)

    // Go higher
    await move(bot, x=seedX, y=seedY, z=-480)

    // Go to location of seeding
    await move(bot, x=point.x-20, y=point.y, z=-480)

    setJobStatus("seeding");

    // Go down and seed
    await move(bot, x=point.x-20, y=point.y, z=-530)

    // Stop suction
    await bot.writePin({
      pin_number: 9,
      pin_value: 0,          // 1 = ON (HIGH), 0 = OFF (LOW)
      pin_mode: 0            // 0 = digital, 1 = analog
    });

    // Go up
    await move(bot, x=point.x-20, y=point.y, z=-480)
    await move(bot, x=point.x, y=point.y, z=-480)

    setJobStatus("watering");

    // Turn on water (usually pin 8 for standard kits)
    await bot.writePin({
      pin_number: 8,
      pin_value: 1,    // 1 = watering on, 0 = watering off
      pin_mode: 0      // 0 = digital, 1 = analog
    });

    await sleep(1500)

    // Turn off water
    await bot.writePin({
      pin_number: 8,
      pin_value: 0,    // 1 = watering on, 0 = watering off
      pin_mode: 0      // 0 = digital, 1 = analog
    });

    setJobStatus("saving the seed");

    const seed = new Seed({
      seed_name: req.body.seed_name ? req.body.seed_name : "random_seed",
      seeding_date: req.body.seeding_date ? req.body.seeding_date : Date.now(),
      seedX: seedX,
      seedY: seedY,
      x: point.x,
      y: point.y,
      z: depth,
    });

    await seed.save();

  }

  // Go to left of seeder position
  await move(bot, x=2500, y=245, z=-410)

  // Go to seeder position
  await move(bot, x=2630, y=245, z=-410)

  // Go up to release it
  await move(bot, x=2630, y=245, z=-395)

  setJobStatus("Finished");

  setTimeout(() => {
    setJobStatus("online");
  }, 3000);

  res.status(200).send({
    "message": "Seeds are planted successfully"
  })
});

// Get all seeds
router.get("/seeds", async (req, res) => {
  const seeds = await Seed.find({});
  res.status(200).send(seeds)
})

// Get future seeds with job id
router.get("/futureSeeds/job/:id", async (req, res) => {
  const seeds = await FutureSeed.find({ seeding_job_id: req.params.id });
  res.status(200).send(seeds)
})

// Get all future seeds
router.get("/futureSeeds", async (req, res) => {
  const seeds = await FutureSeed.find({});
  res.status(200).send(seeds)
})

// Get all seeding jobs
router.get("/seedingJobs", async (req, res) => {
  const seedJobs = await SeedJob.find({});
  res.status(200).send(seedJobs)
})

// Schedule a seeding job
router.post("/schedule", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  if (req.body.topRight === undefined || req.body.bottomLeft === undefined) {
    return res.status(500).send({
      "status": 500,
      "message": "x and y is not sent in body"
    })
  }

  const seedX = parseInt(req.body.seedX)
  const seedY = parseInt(req.body.seedY)
  // const destX = parseInt(req.body.x)
  // const destY = parseInt(req.body.y)
  const depth = parseInt(req.body.z)

  const seedJob = new SeedJob({
    seed_name: req.body.seed_name ? req.body.seed_name : "random_seed",
    seeding_date: req.body.seeding_date ? req.body.seeding_date : Date.now(),
    seedX: seedX,
    seedY: seedY,
    z: depth,
    topRight: req.body.topRight,
    topLeft: req.body.topLeft,
    bottomRight: req.body.bottomRight,
    bottomLeft: req.body.bottomLeft,
  });

  await seedJob.save()

  let plantDetails = await Plant.findOne({ plant_type: req.body.seed_name })
  const seedPoints = await generatePlantablePoints(plantDetails, req.body.topLeft, req.body.bottomRight)

  for (let point of seedPoints) {
    const futureSeed = new FutureSeed({
      seeding_job_id: seedJob.id,
      seed_name: req.body.seed_name,
      seedX: 2130,
      seedY: 20,
      x: point.x,
      y: point.y,
      z: 50,
    });

    await futureSeed.save();
  }

  res.status(200).send({
    "message": "Seed is scheduled successfully"
  })
});

// Update a seeding job
router.put("/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let seedingJob = await SeedJob.findById(req.params.id)
    if (!seedingJob) {
      return res.status(500).send({ message: "No seeding job with the given id found!" })
    }
    
    if (seedingJob.topRight != req.body.topRight || seedingJob.bottomLeft != req.body.bottomLeft) {
      await FutureSeed.deleteMany({ seeding_job_id: req.params.id });
      let plantDetails = await Plant.findOne({ plant_type: req.body.seed_name })
      const seedPoints = await generatePlantablePoints(plantDetails, req.body.topLeft, req.body.bottomRight)

      for (let point of seedPoints) {
        const futureSeed = new FutureSeed({
          seeding_job_id: req.params.id,
          seed_name: req.body.seed_name,
          seedX: req.body.seedX,
          seedY: req.body.seedY,
          x: point.x,
          y: point.y,
          z: 50,
        });

        await futureSeed.save();
      }
    }
    seedingJob.seeding_date = req.body.seeding_date
    seedingJob.seed_name = req.body.seed_name
    seedingJob.seedX = req.body.seedX
    seedingJob.seedY = req.body.seedY
    seedingJob.z = req.body.z
    seedingJob.topRight = req.body.topRight
    seedingJob.topLeft = req.body.topLeft
    seedingJob.bottomRight = req.body.bottomRight
    seedingJob.bottomLeft = req.body.bottomLeft
    await seedingJob.save()

    await session.commitTransaction();
    res.status(200).send({ message: "Seeding job updated successfully" })
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// Delete a seed
router.delete("/seed/:id", async (req, res) => {
  try {
    await Seed.findByIdAndDelete(req.params.id);
    res.status(200).send({ massege: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a future seed by its id
router.delete("/futureSeed/:id", async (req, res) => {
  try {
    await FutureSeed.findByIdAndDelete(req.params.id);
    res.status(200).send({ massege: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a future seed by its id
router.delete("/futureSeed/job/:id", async (req, res) => {
  try {
    await FutureSeed.deleteMany({ seeding_job_id: req.params.id });
    res.status(200).send({ massege: "Items deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a seeding job
router.delete("/:id", async (req, res) => {
  try {
    await SeedJob.findByIdAndDelete(req.params.id);
    await FutureSeed.deleteMany({ seeding_job_id: req.params.id });
    res.status(200).send({ massege: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
