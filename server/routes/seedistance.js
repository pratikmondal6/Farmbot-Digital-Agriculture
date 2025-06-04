const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const Plant = require('../models/plan.js');

// Configuration
const config = {
    includeZAxis: true
};

/**
 * @typedef {Object} Point
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate (optional)
 */

/**
 * @typedef {Object} PlantPosition
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 * @property {string|number} id - Plant ID
 * @property {string} name - Plant name
 * @property {Object} meta - Additional metadata
 */

/**
 * Validates and normalizes plant data
 * @param {Object} plant - Raw plant data
 * @returns {PlantPosition} - Validated plant position
 */
function validatePlantData(plant) {
    // For plants from database that might not have coordinates yet
    const x = typeof plant.x === 'number' ? plant.x : Math.floor(Math.random() * 1000);
    const y = typeof plant.y === 'number' ? plant.y : Math.floor(Math.random() * 1000);

    // Use seeding_depth as z coordinate if available
    const z = typeof plant.seeding_depth === 'number' ? plant.seeding_depth : 
              (typeof plant.z === 'number' ? plant.z : 0);

    // Get plant ID (either _id from database or id from request)
    const id = plant._id || plant.id;

    // Get plant name (either plant_type from database or name from request)
    const name = plant.plant_type || plant.name || `Plant ${id}`;

    // Get minimal_distance if available
    const minimal_distance = typeof plant.minimal_distance === 'number' ? plant.minimal_distance : 0;

    // Get planted_at date if available
    const planted_at = plant.planted_at || new Date().toISOString();

    // Generate openfarm_slug from plant name if not available
    const openfarm_slug = plant.openfarm_slug || name.toLowerCase().replace(/\s+/g, '_');

    return {
        x,
        y,
        z,
        id,
        name,
        minimal_distance,
        meta: {
            planted_at,
            openfarm_slug,
            seeding_depth: z,
            minimal_distance
        }
    };
}

/**
 * Calculates distance between two points
 * @param {Point} point1 - First point
 * @param {Point} point2 - Second point
 * @returns {number} - Distance between points
 */
function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;

    if (config.includeZAxis && point1.z !== undefined && point2.z !== undefined) {
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Fetches plant data from the database
 * @returns {Promise<Array<PlantPosition>>} - Array of plant positions
 */
async function getLocalPlants() {
    try {
        const plants = await Plant.find({});

        // Convert database plants to position format using validatePlantData
        const positions = plants.map(plant => validatePlantData(plant));

        return positions;
    } catch (error) {
        console.error("Error fetching plants from database:", error);
        throw error;
    }
}

/**
 * Finds minimum distance between plants for large datasets
 * @param {Array<PlantPosition>} positions - Array of plant positions
 * @returns {Object} - Minimum distance and closest pair
 */
function findMinimumDistanceLarge(positions) {
    // Implementation for large datasets
    let minDistance = Infinity;
    let closestPair = null;

    // Basic implementation for now
    for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
            const distance = calculateDistance(positions[i], positions[j]);
            if (distance < minDistance) {
                minDistance = distance;
                closestPair = [positions[i], positions[j]];
            }
        }
    }

    return {
        distance: minDistance === Infinity ? 0 : minDistance,
        pair: closestPair
    };
}

/**
 * Finds minimum distance between plants
 * @param {Array<PlantPosition>} positions - Array of plant positions
 * @returns {Object} - Minimum distance and closest pair
 */
function findMinimumDistance(positions) {
    if (positions.length < 2) {
        return {
            distance: 0,
            pair: null
        };
    }

    // For large datasets, use optimized version
    if (positions.length > 1000) {
        return findMinimumDistanceLarge(positions);
    }

    let minDistance = Infinity;
    let closestPair = null;

    for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
            const distance = calculateDistance(positions[i], positions[j]);
            if (distance < minDistance) {
                minDistance = distance;
                closestPair = [positions[i], positions[j]];
            }
        }
    }

    return {
        distance: minDistance === Infinity ? 0 : minDistance,
        pair: closestPair
    };
}

/**
 * Gets plant type statistics
 * @param {Array<PlantPosition>} positions - Array of plant positions
 * @returns {Object} - Plant type statistics
 */
function getPlantTypeStats(positions) {
    const typeStats = {};
    positions.forEach(plant => {
        const type = plant.meta.openfarm_slug || 'unknown';
        typeStats[type] = (typeStats[type] || 0) + 1;
    });
    return typeStats;
}

/**
 * Analyzes plant data to find minimum distances
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzePlantData() {
    try {
        // Get plant data from database
        const plantPositions = await getLocalPlants();

        if (plantPositions.length === 0) {
            return {
                plantCount: 0,
                minDistance: 0,
                closestPair: null,
                positions: [],
                calculationMode: config.includeZAxis ? '3D' : '2D',
                typeStats: {}
            };
        }

        // Calculate minimum distance
        const { distance, pair } = findMinimumDistance(plantPositions);

        // Get plant type statistics
        const typeStats = getPlantTypeStats(plantPositions);

        // Get distance recommendations for each plant type
        const distanceRecommendations = {};
        for (const plant of plantPositions) {
            if (plant.minimal_distance && !distanceRecommendations[plant.name]) {
                distanceRecommendations[plant.name] = plant.minimal_distance;
            }
        }

        return {
            plantCount: plantPositions.length,
            minDistance: distance,
            closestPair: pair,
            positions: plantPositions,
            calculationMode: config.includeZAxis ? '3D' : '2D',
            typeStats,
            distanceRecommendations
        };
    } catch (error) {
        console.error("Error analyzing plant data:", error);
        throw error;
    }
}

// API Routes

/**
 * GET /api/seedistance/analyze
 * Analyzes plant data to find minimum distances
 */
router.get('/analyze', async (req, res) => {
    try {
        const result = await analyzePlantData();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/seedistance/config
 * Gets the current configuration
 */
router.get('/config', (req, res) => {
    res.json(config);
});

/**
 * POST /api/seedistance/config
 * Updates the configuration
 */
router.post('/config', (req, res) => {
    const { includeZAxis } = req.body;

    if (typeof includeZAxis === 'boolean') {
        config.includeZAxis = includeZAxis;
        res.json({ message: 'Configuration updated', config });
    } else {
        res.status(400).json({ error: 'Invalid configuration' });
    }
});

/**
 * GET /api/seedistance/minimum
 * Gets the minimum distance between plants
 */
router.get('/minimum', async (req, res) => {
    try {
        const plantPositions = await getLocalPlants();
        const { distance, pair } = findMinimumDistance(plantPositions);

        res.json({
            minDistance: distance,
            closestPair: pair
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/seedistance/recommendations
 * Gets distance recommendations for all plant types
 */
router.get('/recommendations', async (req, res) => {
    try {
        const plants = await Plant.find({});
        const recommendations = {};

        plants.forEach(plant => {
            if (plant.minimal_distance) {
                recommendations[plant.plant_type] = plant.minimal_distance;
            }
        });

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/seedistance/recommendation/:plantType
 * Gets distance recommendation for a specific plant type
 */
router.get('/recommendation/:plantType', async (req, res) => {
    try {
        const { plantType } = req.params;
        const plant = await Plant.findOne({ plant_type: plantType });

        if (!plant) {
            return res.status(404).json({ error: 'Plant type not found' });
        }

        res.json({
            plantType: plant.plant_type,
            minimalDistance: plant.minimal_distance || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/seedistance/depths
 * Gets seeding depths for all plant types
 */
router.get('/depths', async (req, res) => {
    try {
        const plants = await Plant.find({});
        const depths = {};

        plants.forEach(plant => {
            if (plant.seeding_depth !== undefined) {
                depths[plant.plant_type] = plant.seeding_depth;
            }
        });

        res.json(depths);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/seedistance/depth/:plantType
 * Gets seeding depth for a specific plant type
 */
router.get('/depth/:plantType', async (req, res) => {
    try {
        const { plantType } = req.params;
        const plant = await Plant.findOne({ plant_type: plantType });

        if (!plant) {
            return res.status(404).json({ error: 'Plant type not found' });
        }

        res.json({
            plantType: plant.plant_type,
            seedingDepth: plant.seeding_depth || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/seedistance/check-spacing
 * Checks if plants are properly spaced based on their minimal_distance
 */
router.post('/check-spacing', async (req, res) => {
    try {
        const plantPositions = await getLocalPlants();
        const violations = [];

        // Check each pair of plants
        for (let i = 0; i < plantPositions.length; i++) {
            for (let j = i + 1; j < plantPositions.length; j++) {
                const plant1 = plantPositions[i];
                const plant2 = plantPositions[j];
                const distance = calculateDistance(plant1, plant2);

                // Get the larger of the two minimal distances
                const minRequired = Math.max(
                    plant1.minimal_distance || 0,
                    plant2.minimal_distance || 0
                );

                if (minRequired > 0 && distance < minRequired) {
                    violations.push({
                        plant1: {
                            id: plant1.id,
                            name: plant1.name,
                            position: { x: plant1.x, y: plant1.y, z: plant1.z }
                        },
                        plant2: {
                            id: plant2.id,
                            name: plant2.name,
                            position: { x: plant2.x, y: plant2.y, z: plant2.z }
                        },
                        distance,
                        minRequired,
                        deficit: minRequired - distance
                    });
                }
            }
        }

        res.json({
            violations,
            totalViolations: violations.length,
            plantsChecked: plantPositions.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/seedistance/update-position
 * Updates the position of a plant in the database
 */
router.post('/update-position', async (req, res) => {
    try {
        const { plantId, x, y, z } = req.body;

        if (!plantId) {
            return res.status(400).json({ error: 'Plant ID is required' });
        }

        if (typeof x !== 'number' || typeof y !== 'number') {
            return res.status(400).json({ error: 'Valid x and y coordinates are required' });
        }

        // Find the plant by ID
        const plant = await Plant.findById(plantId);

        if (!plant) {
            return res.status(404).json({ error: 'Plant not found' });
        }

        // Update the plant with the new position
        plant.x = x;
        plant.y = y;

        // If z is provided, update seeding_depth
        if (typeof z === 'number') {
            plant.seeding_depth = z;
        }

        await plant.save();

        res.json({
            message: 'Plant position updated successfully',
            plant: {
                id: plant._id,
                name: plant.plant_type,
                position: {
                    x: plant.x,
                    y: plant.y,
                    z: plant.seeding_depth || 0
                },
                minimal_distance: plant.minimal_distance || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/seedistance/plant-data
 * Gets all plant data including positions, distances, and depths
 */
router.get('/plant-data', async (req, res) => {
    try {
        const plantPositions = await getLocalPlants();

        // Format the data for the frontend
        const plantData = plantPositions.map(plant => ({
            id: plant.id,
            name: plant.name,
            position: {
                x: plant.x,
                y: plant.y,
                z: plant.z
            },
            minimal_distance: plant.minimal_distance || 0,
            seeding_depth: plant.meta.seeding_depth || 0
        }));

        res.json({
            plants: plantData,
            count: plantData.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/seedistance/plant-data/:plantType
 * Gets plant data for a specific plant type
 */
router.get('/plant-data/:plantType', async (req, res) => {
    try {
        const { plantType } = req.params;
        const plant = await Plant.findOne({ plant_type: plantType });

        if (!plant) {
            return res.status(404).json({ error: 'Plant type not found' });
        }

        // Validate and normalize the plant data
        const validatedPlant = validatePlantData(plant);

        // Format the data for the frontend
        const plantData = {
            id: validatedPlant.id,
            name: validatedPlant.name,
            position: {
                x: validatedPlant.x,
                y: validatedPlant.y,
                z: validatedPlant.z
            },
            minimal_distance: validatedPlant.minimal_distance || 0,
            seeding_depth: validatedPlant.meta.seeding_depth || 0
        };

        res.json(plantData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
