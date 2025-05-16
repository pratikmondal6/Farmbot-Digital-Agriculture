const express = require('express');
const router = express.Router();
const Plant = require('../models/plan.js'); // Make sure the filename is correct

router.post('/save', async (req, res) => {
  const { plantType, valueType, value } = req.body;
  try {
    const entry = new Plant({ plantType, valueType, value });
    await entry.save();
    res.status(201).json({ message: 'Saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Add a new plant type
router.post('/add-type', async (req, res) => {
  const { plant_type, minimal_distance = 0, seeding_depth = 0 } = req.body;
  try {
    const plant = new Plant({ plant_type, minimal_distance, seeding_depth });
    await plant.save();
    res.status(201).json({ message: 'Plant type added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add plant type' });
  }
});

// Get all plant types
router.get('/types', async (req, res) => {
  try {
    const plants = await Plant.find({}, 'plant_type');
    const plantTypes = plants.map(p => p.plant_type);
    res.json(plantTypes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plant types' });
  }
});

module.exports = router;