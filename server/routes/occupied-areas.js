//Apis
//GET http://localhost:5001/api/seeds/occupied-areas
//POST http://localhost:5001/api/seeds/calculate-positions

const express = require("express");
const router = express.Router();
const { Seed } = require("../models/seed");
const Plant = require("../models/plan"); // Model with plant_type and minimal_distance

// Helper: Checks if a new seed position overlaps with existing seeds
function isOverlapping(x, y, existingSeeds, radius) {
  return existingSeeds.some(seed => {
    const dx = seed.x - x;
    const dy = seed.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius * 2;
  });
}

// GET /api/seeds/occupied-areas
// Returns rectangular areas already occupied by seeds, based on their plant_type's minimal_distance
router.get("/occupied-areas", async (req, res) => {
  try {
    const seeds = await Seed.find({});
    const plants = await Plant.find({});

    // Create lookup map: plant_type -> minimal_distance
    const spacingMap = {};
    plants.forEach(p => {
      const name = p.plant_type?.toLowerCase().trim();
      if (name) {
        spacingMap[name] = p.minimal_distance || 100;
      }
    });

    const defaultSpacing = 100;

    const areas = seeds.map(seed => {
      const name = seed.seed_name?.toLowerCase().trim();
      const spacing = spacingMap[name] || defaultSpacing;
      const r = spacing / 2;

      return {
        plant: seed.seed_name,
        x1: seed.x - r,
        y1: seed.y - r,
        x2: seed.x + r,
        y2: seed.y + r
      };
    });

    res.status(200).json(areas);
  } catch (error) {
    console.error("Error fetching occupied areas:", error);
    res.status(500).json({ error: "Failed to get occupied areas" });
  }
});

// POST /api/seeds/calculate-positions
// Calculates all valid positions in a workarea based on selected plant type and existing seeds
router.post("/calculate-positions", async (req, res) => {
  try {
    const { plant_type_id, workarea, margin = 50 } = req.body;

    // Validate input
    if (
      !plant_type_id ||
      !workarea ||
      workarea.x1 == null || workarea.x2 == null ||
      workarea.y1 == null || workarea.y2 == null
    ) {
      return res.status(400).json({ error: "Missing required workarea or plant_type_id" });
    }

    // Get selected plant type with spacing info
    const plantType = await Plant.findById(plant_type_id);
    if (!plantType || !plantType.minimal_distance) {
      return res.status(404).json({ error: "Plant type not found or spacing missing" });
    }

    const spacing = plantType.minimal_distance;
    const radius = spacing / 2;

    // Get seeds within area (with buffer for overlap checking)
    const seedsInArea = await Seed.find({
      x: { $gte: workarea.x1 - spacing, $lte: workarea.x2 + spacing },
      y: { $gte: workarea.y1 - spacing, $lte: workarea.y2 + spacing }
    });

    const result = [];

    // Generate grid of positions and check each one
    for (let x = workarea.x1 + margin; x <= workarea.x2 - margin; x += spacing) {
      for (let y = workarea.y1 + margin; y <= workarea.y2 - margin; y += spacing) {
        if (!isOverlapping(x, y, seedsInArea, radius)) {
          result.push({ x: Math.round(x), y: Math.round(y) });
        }
      }
    }

    res.json({ possible_seeds: result });
  } catch (error) {
    console.error("Error in calculate-positions:", error);
    res.status(500).json({ error: "Failed to calculate positions" });
  }
});

module.exports = router;
