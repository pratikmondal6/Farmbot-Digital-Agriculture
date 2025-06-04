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
    // Ensure required numeric coordinates
    if (typeof plant.x !== 'number' || typeof plant.y !== 'number') {
        throw new Error(`Invalid coordinates for plant ${plant.id}`);
    }

    // Ensure required properties with defaults
    return {
        x: plant.x,
        y: plant.y,
        z: typeof plant.z === 'number' ? plant.z : 0,
        id: plant.id,
        name: plant.name || `Plant ${plant.id}`,
        meta: {
            planted_at: plant.planted_at || null,
            openfarm_slug: plant.openfarm_slug || null
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

        // Convert database plants to position format
        const positions = plants.map(plant => ({
            x: Math.random() * 1000, // Mock x position (replace with real data)
            y: Math.random() * 1000, // Mock y position (replace with real data)
            z: 0,                    // Mock z position (replace with real data)
            id: plant._id,
            name: plant.plant_type,
            meta: {
                planted_at: new Date().toISOString(),
                openfarm_slug: plant.plant_type.toLowerCase().replace(/\s+/g, '_')
            }
        }));

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

        return {
            plantCount: plantPositions.length,
            minDistance: distance,
            closestPair: pair,
            positions: plantPositions,
            calculationMode: config.includeZAxis ? '3D' : '2D',
            typeStats
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

module.exports = router;
