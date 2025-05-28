const fetch = require('node-fetch');
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJ1bmtub3duIiwic3ViIjoyODIzOCwiaWF0IjoxNzQ3NjUyMzUwLCJqdGkiOiJkMjkwNmYxZS1lOTU4LTQzOGQtOTczNC05YmY1NDMyNTQyNGMiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsImV4cCI6MTc1MjgzNjM1MCwibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiYm90IjoiZGV2aWNlXzI4MzQ2Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.EbVjJwt-RZkHcY0GkHLaZCsekodTHsT0d5pPXZ0eCQrwqeGl_7MXh8gYuknNdll_RuABtJ85D3pBILO7CzbU8Zp9whUlQwmyI9-5mRVdwPJew-P96R4QAI6frPiY6yoWeGYQobppah1dlUdvxu3_MUsfrxvjQwftBcsj8xxD9eN5OUX110Ya1TLKj1dS0NG4XSa4M9WTvbDABCRM83XH25guBKKZo_mtVB0DoywD5IPEjswcUkYqrD9Lc48KWQ3eu4xRWMDo54FVf58Zd46UJEr38vXzvKmU0s6bVel1NUZ-cJqePEcsajwGRBaBKYb-xQNGMl76fxHkaxAuzXvGyw";

const config = {
    includeZAxis: true
};

let plantPositions = [];

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

async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;

    if (config.includeZAxis && point1.z !== undefined && point2.z !== undefined) {
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    return Math.sqrt(dx * dx + dy * dy);
}

async function getPlants() {
    try {
        const plantsData = await fetchWithAuth("https://my.farm.bot/api/points?filter=plant");

        if (!Array.isArray(plantsData)) {
            throw new Error("Invalid plant data format received");
        }

        plantPositions = plantsData.map(plant => {
            try {
                return validatePlantData(plant);
            } catch (error) {
                console.error(`Error processing plant ${plant.id}: ${error.message}`);
                return null;
            }
        }).filter(plant => plant !== null);

        console.log(`Found ${plantPositions.length} valid plants with z-axis data`);

        const { distance, pair } = findMinimumDistance(plantPositions);
        
        if (distance !== 0) {
            console.log(`Minimum seed distance: ${distance.toFixed(2)} mm`);
            if (pair) {
                console.log(`Closest pair: ${pair[0].name} and ${pair[1].name}`);
            }
        } else {
            console.log("No valid plant pairs found for distance calculation");
        }

        return {
            plantCount: plantPositions.length,
            minDistance: distance,
            closestPair: pair,
            positions: plantPositions,
            calculationMode: config.includeZAxis ? '3D' : '2D'
        };

    } catch (error) {
        console.error("Error fetching plant data:", error.message);
        throw error;
    }
}

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

async function main() {
    try {
        console.log(`Starting seed distance analysis in ${config.includeZAxis ? '3D' : '2D'} mode`);

        // Test token first
        const testResponse = await fetchWithAuth('https://my.farm.bot/api/token');
        console.log("Token validation successful");

        // Get plant data
        const plantData = await getPlants();

        // Additional 3D analysis could be added here
        if (config.includeZAxis) {
            console.log("Performing 3D analysis...");
        }

        return plantData;

    } catch (error) {
        console.error("Error in main function:", error);
        process.exit(1);
    }
}

main().then(result => {
    console.log("\n=== Analysis Results ===");
    console.log(`Mode: ${result.calculationMode}`);
    console.log(`Plants analyzed: ${result.plantCount}`);
    console.log(`Minimum distance: ${result.minDistance.toFixed(2)} mm`);

    if (result.closestPair) {
        console.log(`Closest pair locations:`);
        console.log(`- ${result.closestPair[0].name}: X=${result.closestPair[0].x}, Y=${result.closestPair[0].y}, Z=${result.closestPair[0].z}`);
        console.log(`- ${result.closestPair[1].name}: X=${result.closestPair[1].x}, Y=${result.closestPair[1].y}, Z=${result.closestPair[1].z}`);
    }

    console.log("\nScript completed successfully");
}).catch(error => {
    console.error("Script failed:", error);
});

// Add plant type statistics
function getPlantTypeStats(positions) {
    const typeStats = {};
    positions.forEach(plant => {
        const type = plant.meta.openfarm_slug || 'unknown';
        typeStats[type] = (typeStats[type] || 0) + 1;
    });
    return typeStats;
}

module.exports = {
    getPlants,
    findMinimumDistance,
    calculateDistance,
    config,
    getPlantTypeStats
};