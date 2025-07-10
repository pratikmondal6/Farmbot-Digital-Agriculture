const { Seed } = require("../models/seed");
const { FutureSeed } = require("../models/futureSeed");
const Plant = require('../models/plan.js'); 

function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

async function generatePlantablePoints(plantDetails, topLeft, bottomRight) {
  points = []

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

  return points
}

module.exports = {
  generatePlantablePoints
}
