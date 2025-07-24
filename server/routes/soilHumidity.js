const { Farmbot } = require("farmbot");
const express = require("express");
const router = express.Router();
const { setJobStatus } = require("../services/farmbotStatusService");
const { Humidity } = require("../models/humidity");
const axios = require("axios");
const config = require("config");

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

// Helper function to get sensor readings from the Farmbot API
async function getSensorReadings(token, pin, pinMode = "analog") {
  try {
    const farmbotURL = config.get('farmbotUrl');
    const response = await axios.get(`${farmbotURL}/api/sensor_readings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        pin: pin
      }
    });

    console.log("Sensor readings API response:", response.data);

    // Get the most recent reading
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Sort by created_at in descending order to get the most recent reading
      const sortedReadings = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      const latestReading = sortedReadings[0];
      return {
        value: latestReading.value,
        pin_value: latestReading.value,
        created_at: latestReading.created_at
      };
    }

    // If no readings are available, fall back to a default value
    return { value: 0, pin_value: 0 };
  } catch (error) {
    console.error("Error fetching sensor readings:", error.message);
    throw error;
  }
}

// Endpoint for reading soil humidity at a specific location
router.post("/read-sensor", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    });
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });

  // Get the target coordinates from the request body
  const { x, y, z } = req.body;

  if (x === undefined || y === undefined) {
    return res.status(400).send({
      "status": 400,
      "message": "Missing target coordinates in request body"
    });
  }

  let humidityValue = null;

  try {
    // Connect to the Farmbot
    await bot.connect();
    setJobStatus("reading soil humidity");

    // Constants for soil sensor location
    const SOIL_SENSOR_X = 2630;
    const SOIL_SENSOR_Y = 350;
    const SOIL_SENSOR_APPROACH_Z = -350;
    const SOIL_SENSOR_ATTACH_Z = -410;
    const SOIL_SENSOR_X_OFFSET = 2550;
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

    setJobStatus("moving to target position");

    // Step 5: Move to target location
    const targetZ = z || -410; // Default to -410 if z is not provided
    try {
      console.log("Attempting to move to target location...");
      await move(bot, x, y, targetZ);
      console.log("Successfully moved to target location");
    } catch (targetError) {
      console.error("Error moving to target location:", targetError);
      // Try with a slightly adjusted Z coordinate if the exact one fails
      console.log("Trying with adjusted Z coordinate for target location...");
      const adjustedZ = Number(targetZ) + 10; // Try 10mm higher
      await move(bot, x, y, adjustedZ);
    }

    // Step 6: Change depth to -530 for reading
    try {
      console.log("Changing depth to -530...");
      await move(bot, x, y, -530);
      console.log("Successfully changed depth to -530");

      // Wait for the bot to stabilize after moving to the depth
      await sleep(1000);
    } catch (depthError) {
      console.error("Error changing depth to -530:", depthError);
      // Continue with the process even if changing depth fails
    }

    setJobStatus("reading soil humidity");

    // Step 7: Read from the soil humidity sensor
    try {
      console.log("Reading from soil humidity sensor pin:", SOIL_SENSOR_PIN);

      // Pin mode is set directly in the readPin call
      // No need for separate pinMode call as it's not supported by the Farmbot API

      // Small delay before reading the pin
      await sleep(500);

      // Now read the pin value using the Farmbot API
      let pinReadResult = await getSensorReadings(token, SOIL_SENSOR_PIN, "analog");
      // Fallback to direct pin reading if API call fails
      if (!pinReadResult || (pinReadResult.value === 0 && pinReadResult.pin_value === 0)) {
        console.log("Falling back to direct pin reading...");
        try {
          const directPinResult = await bot.readPin({
            pin_number: SOIL_SENSOR_PIN,
            pin_mode: 1 // 1 = analog
          });
          if (directPinResult) {
            console.log("Direct pin reading successful:", directPinResult);
            pinReadResult = directPinResult;
          }
        } catch (pinError) {
          console.error("Error with direct pin reading:", pinError);
          // Continue with the API result even if it's zero
        }
      }

      // Log the entire pinReadResult object to see its structure
      console.log("Pin read result:", pinReadResult);

      // Get the current time
      const read_at = new Date().toISOString();
      console.log("Read at:", read_at);

      // Convert the raw sensor value to a humidity percentage
      // Check different possible locations of the value in the pinReadResult object
      let rawValue = 0;
      if (pinReadResult && typeof pinReadResult === 'object') {
        if (pinReadResult.value !== undefined) {
          rawValue = pinReadResult.value;
        } else if (pinReadResult.pin_value !== undefined) {
          rawValue = pinReadResult.pin_value;
        } else if (pinReadResult.data && pinReadResult.data.value !== undefined) {
          rawValue = pinReadResult.data.value;
        } else if (pinReadResult.data && pinReadResult.data.pin_value !== undefined) {
          rawValue = pinReadResult.data.pin_value;
        }
      }
      // Display the actual raw value from the sensor (0-1023)
      console.log("Raw sensor value:", rawValue);

      // Calculate humidity percentage - higher values mean wetter soil, lower values mean drier soil
      humidityValue = Math.round((rawValue / 1023) * 100);

      // Log the reading with position information
      console.log("Sensor reading:", {
        x: x,
        y: y,
        z: targetZ,
        mode: 1,
        pin: SOIL_SENSOR_PIN,
        value: rawValue,
        read_at: read_at
      });
    } catch (sensorError) {
      console.error("Error reading from soil humidity sensor:", sensorError);
      throw sensorError; // Propagate the error instead of simulating data
    }

    // Step 8: Move back to a safe position
    try {
      await move(bot, x, y, targetZ + 50);
    } catch (finalMoveError) {
      console.error("Error moving to safe height:", finalMoveError);
    }

    // Step 9: The soil sensor will be returned to its storage position in the finally block
    // This ensures it happens even if an error occurs

    // Save the humidity reading to the database
    const humidityReading = new Humidity({
      reading_value: humidityValue,
      x: x,
      y: y,
      z: targetZ,
      seed_position_x: x,
      seed_position_y: y
    });

    await humidityReading.save();

    setJobStatus("Finished");
    setTimeout(() => {
      setJobStatus("online");
    }, 3000);

    const response = {
      "status": 200,
      "message": "Humidity reading completed successfully",
      "reading": {
        value: humidityValue,
        x: x,
        y: y,
        z: targetZ
      }
    };

    return res.status(200).send(response);
  } catch (error) {
    console.error("Error in soil humidity reading:", error);
    setJobStatus("error");

    return res.status(500).send({
      "status": 500,
      "message": "An error occurred while reading soil humidity: " + error.message
    });
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
        const SOIL_SENSOR_X_OFFSET = 2550;

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
