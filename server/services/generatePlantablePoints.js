const express = require("express");
const router = express.Router();
const { Seed } = require("../models/seed");
const { FutureSeed } = require("../models/futureSeed");
const Plant = require('../models/plan.js'); 
const { SeedingPointsDistribution } = require("../models/seedingPointsDistribution.js")

function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

async function generatePlantablePoints(plantDetails, topLeft, bottomRight) {
  const seedingPointsDistribution = await SeedingPointsDistribution.find({})
  const distribution = seedingPointsDistribution[0].distribution

  let points = []
  console.log("Plant details")
  console.log(plantDetails)
  console.log(topLeft)
  console.log(bottomRight)

  let allPlantDetails = await Plant.find({})
  // console.log("All plant details: ")
  // console.log(allPlantDetails)

  const find_plant_distance = (plant_name, allPlantDetails) => {
    for (let plant of allPlantDetails) {
      if (plant.plant_type == plant_name) {
        return plant.minimal_distance
      } 
    }
    return undefined
  }

  let existingSeeds = await Seed.find({})
  existingSeeds.forEach((p) => {
    p.x = parseInt(p.x);
    p.y = parseInt(p.y);
    p["minDistance"] = find_plant_distance(p.seed_name, allPlantDetails)
  });
  // console.log("All existing seeds details:")
  // console.log(existingSeeds)

  let futureSeeds = await FutureSeed.find({})
  futureSeeds.forEach((p) => {
    p.x = parseInt(p.x);
    p.y = parseInt(p.y);
    p["minDistance"] = find_plant_distance(p.seed_name, allPlantDetails)
  });
  // console.log("All future seeds details:")
  // console.log(futureSeeds)

  dist = plantDetails.minimal_distance
  if (dist == 0) {
    dist = 50
  }

  xLeft = parseInt(topLeft.x, 10)
  xRight = parseInt(bottomRight.x, 10)
  yUp = parseInt(topLeft.y, 10)
  yDown = parseInt(bottomRight.y, 10)

  if (distribution == "efficient") {
    for (let y = yDown; y <= yUp; y += 1) {
      for (let x = xLeft; x <= xRight; x += 1) {
        const candidate = { x, y, minDistance: dist  };

        // Check against existing seeds' exclusion zones
        const isTooCloseToExisting = existingSeeds.some(seed => {
          // console.log(seed.minDistance)
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });

        if (isTooCloseToExisting) continue;

        // Check against future seeds' exclusion zones
        const isTooCloseToFuture = futureSeeds.some(seed => {
          // console.log(seed.minDistance)
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });

        if (isTooCloseToFuture) continue;

        if (points.length == 0) {
          points.push(candidate);
          continue
        }

        // Check against new seeds' exclusion zones
        const isTooCloseToNew = points.some(seed => {
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });
        
        if (isTooCloseToNew) continue;

        points.push(candidate);
      }
    }
  }

  else if (distribution == "normal") {
    for (let y = yDown; y <= yUp; y += dist) {
      for (let x = xLeft; x <= xRight; x += 1) {
        const candidate = { x, y, minDistance: dist  };

        // Check against existing seeds' exclusion zones
        const isTooCloseToExisting = existingSeeds.some(seed => {
          // console.log(seed.minDistance)
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });

        if (isTooCloseToExisting) continue;

        // Check against future seeds' exclusion zones
        const isTooCloseToFuture = futureSeeds.some(seed => {
          // console.log(seed.minDistance)
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });

        if (isTooCloseToFuture) continue;

        if (points.length == 0) {
          points.push(candidate);
          continue
        }

        // Check against new seeds' exclusion zones
        const isTooCloseToNew = points.some(seed => {
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });
        
        if (isTooCloseToNew) continue;

        points.push(candidate);
      }
    }
  }
  
  else if (distribution == "useAllSpace") {
    for (let y = yDown; y <= yUp; y += 1) {
      for (let x = xLeft; x <= xRight; x += dist) {
        const candidate = { x, y, minDistance: dist  };

        // Check against existing seeds' exclusion zones
        const isTooCloseToExisting = existingSeeds.some(seed => {
          // console.log(seed.minDistance)
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });

        if (isTooCloseToExisting) continue;

        // Check against future seeds' exclusion zones
        const isTooCloseToFuture = futureSeeds.some(seed => {
          // console.log(seed.minDistance)
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });

        if (isTooCloseToFuture) continue;

        if (points.length == 0) {
          points.push(candidate);
          continue
        }

        // Check against new seeds' exclusion zones
        const isTooCloseToNew = points.some(seed => {
          const tempDist = distance(candidate, seed);
          return (tempDist < seed.minDistance || tempDist < dist);
        });
        
        if (isTooCloseToNew) continue;

        points.push(candidate);
      }
    }
  }

  return points
}

router.post("/", async (req, res) => {
  let plantDetails = await Plant.findOne({ plant_type: req.body.seed_name })
  seedPoints = await generatePlantablePoints(plantDetails, req.body.topLeft, req.body.bottomRight)
  res.status(200).send(seedPoints)
})

module.exports = {
  generatePlantablePoints,
  router
}
