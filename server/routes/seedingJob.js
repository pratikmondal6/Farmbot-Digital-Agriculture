const express = require("express");
const router = express.Router();
const { Seed } = require("../models/seed");
const { SeedJob } = require("../models/seedingJob");
const { Farmbot } =  require("farmbot");
const { setJobStatus } = require("../services/farmbotStatusService");
const axios = require("axios")

const move = async (bot, x, y, z) => {
  await bot.moveAbsolute({ x: x, y: y, z: z, speed: 100 });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findSeedPoints(plantDetails, topLeft, bottomRight) {
  points = []
  dist = plantDetails.minimal_distance
  if (dist == 0) {
    dist = 50
  }
  xLeft = parseInt(topLeft.x, 10)
  xRight = parseInt(bottomRight.x, 10)
  yUp = parseInt(topLeft.y, 10)
  yDown = parseInt(bottomRight.y, 10)

  for (let y = yDown+(dist/2); y <= yUp-(dist/2); y += dist) {
    for (let x = xLeft+(dist/2); x <= xRight-(dist/2); x += dist) {
      points.push({ x, y });
    }
  }

  console.log("Points:")
  console.log(points)
  return points
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

  console.log("http://localhost:5000/plant/details/" + req.body.seed_name)
  console.log(req.body)

  let plantDetails = await axios.get("http://localhost:5000/plant/details/" + req.body.seed_name)
  plantDetails = plantDetails.data
  console.log("Plant details:")
  console.log(plantDetails)
  if (!plantDetails) {
    plantDetails = {minimal_distance: 100}
  }
  const seedPoints = findSeedPoints(plantDetails, req.body.topLeft, req.body.bottomRight)

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
    await move(bot, x=point.x, y=point.y, z=-480)

    setJobStatus("seeding");

    // Go down and seed
    await move(bot, x=point.x, y=point.y, z=-550 - depth)

    // Stop suction
    await bot.writePin({
      pin_number: 9,
      pin_value: 0,          // 1 = ON (HIGH), 0 = OFF (LOW)
      pin_mode: 0            // 0 = digital, 1 = analog
    });

    // Go up
    await move(bot, x=point.x, y=point.y, z=-480)

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

  for (let point of seedPoints) {

    setJobStatus("watering");

    // Go to location of seeding
    await move(bot, x=point.x, y=point.y, z=-480)

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

  res.status(200).send({
    "message": "Seed is scheduled successfully"
  })
});

// Update a seeing job
router.put("/:id", async (req, res) => {
  try {
    const updated = await SeedJob.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          seed_name: req.body.seed_name,
          seeding_date: req.body.seeding_date,
          seedX: req.body.seedX,
          seedY: req.body.seedY,
          z: req.body.z,
          topRight: req.body.topRight,
          topLeft: req.body.topLeft,
          bottomRight: req.body.bottomRight,
          bottomLeft: req.body.bottomLeft,
        }
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Delete a seeding job
router.delete("/:id", async (req, res) => {
  try {
    await SeedJob.findByIdAndDelete(req.params.id);
    res.status(200).send({ massege: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
