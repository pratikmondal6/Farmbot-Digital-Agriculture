const express = require("express");
const router = express.Router();
const { Seed } = require("../models/seed");
const { Farmbot } =  require("farmbot");
const { setJobStatus } = require("../services/farmbotStatusService");

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

  if (req.body.x === undefined || req.body.y === undefined) {
    return res.status(500).send({
      "status": 500,
      "message": "x and y is not sent in body"
    })
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });
  await bot.connect()

  const seedX = parseInt(req.body.seedX)
  const seedY = parseInt(req.body.seedY)
  const destX = parseInt(req.body.x)
  const destY = parseInt(req.body.y)
  const depth = parseInt(req.body.z)

  setJobStatus("fetching seeds");

  // Go to higher than seeder object
  await move(bot, x=2630, y=245, z=-395)

  // Go down to get seeder object
  await move(bot, x=2630, y=245, z=-410)

  // Go a little outside to take it out
  await move(bot, x=2500, y=245, z=-410)

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
  await move(bot, x=destX, y=destY, z=-480)

  setJobStatus("seeding");

  // Go down and seed
  await move(bot, x=destX, y=destY, z=-550 - depth)

  // Stop suction
  await bot.writePin({
    pin_number: 9,
    pin_value: 0,          // 1 = ON (HIGH), 0 = OFF (LOW)
    pin_mode: 0            // 0 = digital, 1 = analog
  });

  // Go up
  await move(bot, x=destX, y=destY, z=-480)

  const seed = new Seed({
    seed_name: req.body.seed_name ? req.body.seed_name : "random_seed",
    seeding_date: req.body.seeding_date ? req.body.seeding_date : Date.now(),
    x: destX,
    y: destY,
    z: depth,
  });

  setJobStatus("watering");

  // Turn on water (usually pin 8 for standard kits)
  await bot.writePin({
    pin_number: 8,
    pin_value: 1,    // 1 = watering on, 0 = watering off
    pin_mode: 0      // 0 = digital, 1 = analog
  });

  await sleep(2000)

  // Turn off water
  await bot.writePin({
    pin_number: 8,
    pin_value: 0,    // 1 = watering on, 0 = watering off
    pin_mode: 0      // 0 = digital, 1 = analog
  });

  // // Wait 1 second and turn it off
  // (async () => {
  //   await bot.writePin({
  //     pin_number: 8,
  //     pin_value: 0,
  //     pin_mode: 0
  //   });
  // }, 2000);

  await seed.save();

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
    "message": "Seed is planted successfully"
  })
});

// Get all seeds
router.get("/seeds", async (req, res) => {
  const seeds = await Seed.find({});
  res.status(200).send(seeds)
})

// Update a seeing job
router.put("/:id", async (req, res) => {
  try {
    const updated = await Seed.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          seed_name: req.body.seed_name,
          seeding_date: req.body.seeding_date,
          seedX: req.body.seedX,
          seedY: req.body.seedY,
          x: req.body.x,
          y: req.body.y,
          z: req.body.z,
        }
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a seeding job
router.delete("/:id", async (req, res) => {
  try {
    await Seed.findByIdAndDelete(req.params.id);
    res.status(200).send({ massege: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
