const express = require("express");
const router = express.Router();
const { SeedingPointsDistribution } = require("../models/seedingPointsDistribution.js")

// Update
router.put("/", async (req, res) => {
  try {
    const seedingPointsDistribution = await SeedingPointsDistribution.find({})
    const distribution = seedingPointsDistribution[0].distribution
    console.log(distribution)

    if (!req.body.distribution) {
      res.status(500).send({message: "No distribution specified"})
    }

    seedingPointsDistribution[0].distribution = req.body.distribution
    await seedingPointsDistribution[0].save()

    res.status(200).send({message: "Distribution updated"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
