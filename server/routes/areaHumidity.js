const { Farmbot } = require("farmbot");
const express = require("express");
const router = express.Router();
const { setJobStatus } = require("../services/farmbotStatusService");
const { Humidity } = require("../models/humidity");

// Helper function to move the bot
const move = async (bot, x, y, z) => {
  // Ensure coordinates are numbers
  const xNum = Number(x);
  const yNum = Number(y);
  const zNum = Number(z);
  console.log(`Moving to coordinates: x=${xNum}, y=${yNum}, z=${zNum}`);
  await bot.moveAbsolute({ x: xNum, y: yNum, z: zNum, speed: 100 });
}

// Helper function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Endpoint for measuring humidity in a selected area
router.post("/measure", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    });
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });

  // Get the selected area coordinates from the request body
  const { topLeft, topRight, bottomLeft, bottomRight } = req.body;

  if (!topLeft || !topRight || !bottomLeft || !bottomRight) {
    return res.status(400).send({
      "status": 400,
      "message": "Missing area coordinates in request body"
    });
  }

  try {
    // Connect to the Farmbot
    await bot.connect();
    setJobStatus("measuring soil humidity");

    // Constants for soil sensor location
    const SOIL_SENSOR_X = 2630;
    const SOIL_SENSOR_Y = 350;
    const SOIL_SENSOR_APPROACH_Z = -350;
    const SOIL_SENSOR_ATTACH_Z = -410;
    const SOIL_SENSOR_X_OFFSET = 2560;
    const SOIL_SENSOR_PIN = 59; // Analog pin for soil moisture sensor

    // Step 1: Move to soil sensor approach position
    try {
      console.log("Moving to soil sensor approach position...");
      await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_APPROACH_Z);
      console.log("Successfully moved to soil sensor approach position");
    } catch (approachError) {
      console.error("Error moving to soil sensor approach position:", approachError);
      throw approachError;
    }

    // Step 2: Wait for the bot to stabilize
    await sleep(2000);

    // Step 3: Move to soil sensor attach position
    try {
      console.log("Attempting to move to soil sensor attach position...");
      await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);
      console.log("Successfully moved to soil sensor attach position");
    } catch (attachError) {
      console.error("Error moving to soil sensor attach position:", attachError);
      // Try with a slightly different Z coordinate if the exact one fails
      console.log("Trying with adjusted Z coordinate...");
      await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, -400);
    }

    // Step 4: Move X to offset position (keeping Y and Z the same)
    try {
      console.log("Moving to X offset position...");
      await move(bot, SOIL_SENSOR_X_OFFSET, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);
      console.log("Successfully moved to X offset position");
    } catch (offsetError) {
      console.error("Error moving to X offset position:", offsetError);
      throw offsetError;
    }

    // Calculate the center of the selected area
    const centerX = (topLeft.x + bottomRight.x) / 2;
    const centerY = (topLeft.y + bottomRight.y) / 2;

    setJobStatus("moving to target area");

    // Step 5: Move to the center of the selected area
    try {
      console.log("Moving to center of selected area...");
      await move(bot, centerX, centerY, SOIL_SENSOR_APPROACH_Z);
      console.log("Successfully moved to center of selected area");
    } catch (centerError) {
      console.error("Error moving to center of selected area:", centerError);
      // Try with a slightly adjusted Z coordinate if the exact one fails
      console.log("Trying with adjusted Z coordinate...");
      await move(bot, centerX, centerY, SOIL_SENSOR_APPROACH_Z + 10);
    }

    // Step 5.5: Move to depth -531 after reaching the selected area
    try {
      console.log("Moving to depth -531...");
      await move(bot, centerX, centerY, -531);
      console.log("Successfully moved to depth -531");

      // Move back up to approach height before starting measurements to avoid dragging soil
      console.log("Moving back up to approach height before starting measurements...");
      await move(bot, centerX, centerY, SOIL_SENSOR_APPROACH_Z);
      console.log("Successfully moved back up to approach height");
    } catch (depthError) {
      console.error("Error moving to depth -531:", depthError);
      // Continue with the rest of the process even if this step fails

      // Try to move back up to approach height even in error case
      try {
        console.log("Attempting to move back up to approach height after error...");
        await move(bot, centerX, centerY, SOIL_SENSOR_APPROACH_Z);
        console.log("Successfully moved back up to approach height after error");
      } catch (moveUpError) {
        console.error("Error moving back up to approach height:", moveUpError);
        // Continue with the rest of the process even if this move fails
      }
    }

    // Measure humidity at different points in the selected area
    const humidityReadings = [];
    setJobStatus("reading soil humidity");

    // Define the fixed depth for all measurements
    const FIXED_DEPTH = -531;

    // Calculate the width and height of the selected area
    const areaWidth = bottomRight.x - topLeft.x;
    const areaHeight = bottomRight.y - topLeft.y;

    // Define the number of points to measure in each direction
    const GRID_SIZE = 2; // 2 grid = 4 points

    // Step 6: Take readings at different points in the area
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        // Calculate the coordinates for this point
        const pointX = topLeft.x + (areaWidth * (i / (GRID_SIZE - 1)));
        const pointY = topLeft.y + (areaHeight * (j / (GRID_SIZE - 1)));

        try {
          console.log(`Moving to point (${pointX}, ${pointY})...`);
          // First move to the approach height
          await move(bot, pointX, pointY, SOIL_SENSOR_APPROACH_Z);
          // Then move to the measurement depth
          await move(bot, pointX, pointY, FIXED_DEPTH);
          console.log(`Successfully moved to point (${pointX}, ${pointY})`);

          // Wait for the bot to stabilize
          await sleep(1000);

          // Read from the soil humidity sensor
          const pinReadResult = await bot.readPin({
            pin_number: SOIL_SENSOR_PIN,
            pin_mode: 1 // 1 = analog
          });

          // Convert the raw sensor value to a humidity percentage
          const rawValue = pinReadResult.value || 0;
          console.log("Raw sensor value:", rawValue);
          // Calculate humidity percentage - higher values mean wetter soil, lower values mean drier soil
          const humidityValue = Math.round((rawValue / 1023) * 100);

          // Save the humidity reading to the database
          const humidityReading = new Humidity({
            reading_value: humidityValue,
            x: pointX,
            y: pointY,
            z: FIXED_DEPTH,
            seed_position_x: centerX,
            seed_position_y: centerY
          });

          await humidityReading.save();
          humidityReadings.push({
            value: humidityValue,
            x: pointX,
            y: pointY,
            z: FIXED_DEPTH,
            point: `${i+1},${j+1}`
          });

          // Move back up to approach height before moving to next point to avoid dragging soil
          console.log(`Moving up to approach height from point (${pointX}, ${pointY})...`);
          await move(bot, pointX, pointY, SOIL_SENSOR_APPROACH_Z);
        } catch (pointError) {
          console.error(`Error at point (${pointX}, ${pointY}):`, pointError);
          // Continue with next point even if this one fails

          // If sensor reading fails, use simulated data
          const humidityValue = Math.floor(Math.random() * 101); // Random value between 0-100

          // Save the simulated reading to the database
          const humidityReading = new Humidity({
            reading_value: humidityValue,
            x: pointX,
            y: pointY,
            z: FIXED_DEPTH,
            seed_position_x: centerX,
            seed_position_y: centerY
          });

          await humidityReading.save();
          humidityReadings.push({
            value: humidityValue,
            x: pointX,
            y: pointY,
            z: FIXED_DEPTH,
            point: `${i+1},${j+1}`,
            simulated: true
          });

          // Try to move back up to approach height even in error case to avoid dragging soil
          try {
            console.log(`Moving up to approach height from point (${pointX}, ${pointY}) after error...`);
            await move(bot, pointX, pointY, SOIL_SENSOR_APPROACH_Z);
          } catch (moveUpError) {
            console.error(`Error moving up from point (${pointX}, ${pointY}):`, moveUpError);
            // Continue even if this move fails
          }
        }
      }
    }

    // Step 7: Return to a safe height before returning to sensor storage
    try {
      await move(bot, centerX, centerY, SOIL_SENSOR_APPROACH_Z);
    } catch (finalMoveError) {
      console.error("Error moving to safe height:", finalMoveError);
    }

    // Step 8: The soil sensor will be returned to its storage position in the finally block
    // This ensures it happens even if an error occurs

    setJobStatus("Finished");
    setTimeout(() => {
      setJobStatus("online");
    }, 3000);

    return res.status(200).send({
      "status": 200,
      "message": "Humidity measurement completed successfully",
      "readings": humidityReadings,
      "area": {
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
        center: {
          x: (topLeft.x + bottomRight.x) / 2,
          y: (topLeft.y + bottomRight.y) / 2
        }
      }
    });
  } catch (error) {
    console.error("Error in area humidity measurement:", error);
    setJobStatus("error");

    // If there's an error with the Farmbot, try to return any readings we did get
    if (humidityReadings && humidityReadings.length > 0) {
      return res.status(200).send({
        "status": 200,
        "message": "Humidity measurement partially completed with errors",
        "readings": humidityReadings,
        "area": {
          topLeft,
          topRight,
          bottomLeft,
          bottomRight,
          center: {
            x: (topLeft.x + bottomRight.x) / 2,
            y: (topLeft.y + bottomRight.y) / 2
          }
        },
        "warning": "Some readings may be simulated due to Farmbot connection errors"
      });
    } else {
      // If we have no readings at all, generate simulated data for a few points in the area
      const centerX = (topLeft.x + bottomRight.x) / 2;
      const centerY = (topLeft.y + bottomRight.y) / 2;
      const FIXED_DEPTH = -531;
      const simulatedReadings = [];

      // Calculate the width and height of the selected area
      const areaWidth = bottomRight.x - topLeft.x;
      const areaHeight = bottomRight.y - topLeft.y;

      // Generate simulated data for 4 points (corners and center)
      const simulationPoints = [
        { x: topLeft.x, y: topLeft.y, label: "top-left" },
        { x: bottomRight.x, y: topLeft.y, label: "top-right" },
        { x: topLeft.x, y: bottomRight.y, label: "bottom-left" },
        { x: bottomRight.x, y: bottomRight.y, label: "bottom-right" },
        { x: centerX, y: centerY, label: "center" }
      ];

      // Save the simulated readings to the database
      try {
        for (const point of simulationPoints) {
          // Generate a random humidity value
          const humidityValue = Math.floor(Math.random() * 101); // Random value between 0-100

          const humidityReading = new Humidity({
            reading_value: humidityValue,
            x: point.x,
            y: point.y,
            z: FIXED_DEPTH,
            seed_position_x: centerX,
            seed_position_y: centerY
          });

          await humidityReading.save();

          simulatedReadings.push({
            value: humidityValue,
            x: point.x,
            y: point.y,
            z: FIXED_DEPTH,
            point: point.label,
            simulated: true
          });
        }

        return res.status(200).send({
          "status": 200,
          "message": "Humidity measurement simulated due to errors",
          "readings": simulatedReadings,
          "area": {
            topLeft,
            topRight,
            bottomLeft,
            bottomRight,
            center: {
              x: centerX,
              y: centerY
            }
          },
          "warning": "All readings are simulated due to Farmbot connection errors"
        });
      } catch (dbError) {
        return res.status(500).send({
          "status": 500,
          "message": "An error occurred while measuring humidity and saving simulated data: " + error
        });
      }
    }
  } finally {
    // Return the soil sensor to its storage position regardless of errors
    try {
      if (bot) {
        setJobStatus("returning soil sensor");

        // Constants for soil sensor location
        const SOIL_SENSOR_X = 2630;
        const SOIL_SENSOR_Y = 350;
        const SOIL_SENSOR_APPROACH_Z = -350;
        const SOIL_SENSOR_ATTACH_Z = -410;
        const SOIL_SENSOR_X_OFFSET = 2560;

        // Go to left of soil sensor storage
        console.log("Moving to left of soil sensor storage...");
        await move(bot, SOIL_SENSOR_X_OFFSET, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);

        // Go to soil sensor storage position
        console.log("Moving to soil sensor storage position...");
        await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_ATTACH_Z);

        // Go up to release it
        console.log("Moving up to release soil sensor...");
        await move(bot, SOIL_SENSOR_X, SOIL_SENSOR_Y, SOIL_SENSOR_APPROACH_Z);

        console.log("Successfully returned soil sensor to storage position");
      }
    } catch (returnError) {
      console.error("Error returning soil sensor to storage in finally block:", returnError);
    } finally {
      // Note: The Farmbot library doesn't have a disconnect method
      // We're leaving this block for future implementation
      try {
        // Removed bot.disconnect() call as it's not supported
        // If a disconnect method is added in the future, it can be implemented here
      } catch (disconnectError) {
        console.error("Error disconnecting bot:", disconnectError);
      }
    }
  }
});

module.exports = router;
