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
  let points2 = []
  let points3 = []
  let points4 = []
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

      if (points2.length == 0) {
        points2.push(candidate);
        continue
      }

      // Check against new seeds' exclusion zones
      const isTooCloseToNew = points2.some(seed => {
        const tempDist = distance(candidate, seed);
        return (tempDist < seed.minDistance || tempDist < dist);
      });
      
      if (isTooCloseToNew) continue;

      points2.push(candidate);
    }
  }
  
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

      if (points3.length == 0) {
        points3.push(candidate);
        continue
      }

      // Check against new seeds' exclusion zones
      const isTooCloseToNew = points3.some(seed => {
        const tempDist = distance(candidate, seed);
        return (tempDist < seed.minDistance || tempDist < dist);
      });
      
      if (isTooCloseToNew) continue;

      points3.push(candidate);
    }
  }

  const triangleDist = dist * Math.sqrt(3) / 2
  for (let y = yDown; y <= yUp; y += triangleDist) {
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

      if (points4.length == 0) {
        points4.push(candidate);
        continue
      }

      // Check against new seeds' exclusion zones
      const isTooCloseToNew = points4.some(seed => {
        const tempDist = distance(candidate, seed);
        return (tempDist < seed.minDistance || tempDist < dist);
      });
      
      if (isTooCloseToNew) continue;

      points4.push(candidate);
    }
  }


  if (distribution == "efficient") {
    const longest = [points, points2, points3, points4].reduce((a, b) =>
      b.length > a.length ? b : a
    );
    return longest
  }
  else if (distribution == "normal" && points2.length >= points3.length) {
    return points2
  }
  return points3
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
