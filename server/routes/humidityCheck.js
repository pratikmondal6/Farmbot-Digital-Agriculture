const express = require("express");
const router = express.Router();
const { Humidity } = require("../models/humidity");
const { Farmbot } = require("farmbot");
const { setJobStatus } = require("../services/farmbotStatusService");

const move = async (bot, x, y, z) => {
  await bot.moveAbsolute({ x: x, y: y, z: z, speed: 100 });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

router.post("/check", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  if (req.body.x === undefined || req.body.y === undefined || req.body.z === undefined || 
      req.body.seedX === undefined || req.body.seedY === undefined) {
    return res.status(400).send({
      "status": 400,
      "message": "Missing required parameters: x, y, z, seedX, seedY"
    })
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });

  try {
    await bot.connect();
    setJobStatus("moving to target position");

    const seedX = parseInt(req.body.seedX);
    const seedY = parseInt(req.body.seedY);
    const destX = parseInt(req.body.x);
    const destY = parseInt(req.body.y);
    const destZ = parseInt(req.body.z);

    // Constants for toolbay area and humidity sensor
    const TOOLBAY_X = 2630;
    const TOOLBAY_Y = 350;
    const TOOLBAY_Z_APPROACH = -390;
    const TOOLBAY_Z_ATTACH = -410;

    // 1. Move to toolbay area (approach position)
    await move(bot, TOOLBAY_X, TOOLBAY_Y, TOOLBAY_Z_APPROACH);

    // 2. Move down to attach the humidity sensor
    await move(bot, TOOLBAY_X, TOOLBAY_Y, TOOLBAY_Z_ATTACH);

    // 3. Turn on the vacuum pump to attach the tool
    await bot.writePin({
      pin_number: 9,
      pin_value: 1,
      pin_mode: 0
    });

    // Wait for the tool to attach (4 seconds)
    await sleep(4000);

    // 4. Move up slightly with the tool attached
    await move(bot, TOOLBAY_X, TOOLBAY_Y, TOOLBAY_Z_APPROACH);

    // 5. Move to the destination coordinates (slightly above)
    await move(bot, destX, destY, destZ - 50);

    // 6. Move down to the soil level
    setJobStatus("checking humidity");
    await move(bot, destX, destY, destZ);

    // 7. Read the humidity sensor (assuming it's connected to pin 59)
    // Note: The actual pin number may need to be adjusted based on the Farmbot configuration
    const sensorReading = await bot.readPin({
      pin_number: 59,
      pin_mode: 1  // 1 = analog
    });

    // 8. Move back up
    await move(bot, destX, destY, destZ - 50);

    // 9. Return to toolbay to detach the tool
    await move(bot, TOOLBAY_X, TOOLBAY_Y, TOOLBAY_Z_APPROACH);

    // 10. Move down to the toolbay
    await move(bot, TOOLBAY_X, TOOLBAY_Y, TOOLBAY_Z_ATTACH);

    // 11. Turn off the vacuum pump to detach the tool
    await bot.writePin({
      pin_number: 9,
      pin_value: 0,
      pin_mode: 0
    });

    // 12. Move up from the toolbay
    await move(bot, TOOLBAY_X, TOOLBAY_Y, TOOLBAY_Z_APPROACH);

    // 13. Save the humidity reading to the database
    const humidityReading = new Humidity({
      reading_value: sensorReading.value,
      x: destX,
      y: destY,
      z: destZ,
      seed_position_x: seedX,
      seed_position_y: seedY
    });

    await humidityReading.save();

    setJobStatus("Finished");
    setTimeout(() => setJobStatus("online"), 3000);

    return res.status(200).send({
      "status": 200,
      "message": "Humidity check completed successfully",
      "reading": sensorReading.value
    });

  } catch (error) {
    console.error("Error during humidity check:", error);
    return res.status(500).send({
      "status": 500,
      "message": "An error occurred during humidity check: " + error.message
    });
  } finally {
    // Ensure the bot is disconnected
    if (bot && bot.client) {
      await bot.disconnect();
    }
  }
});

// Get all humidity readings
router.get("/readings", async (req, res) => {
  try {
    const readings = await Humidity.find({}).sort({ reading_date: -1 });
    res.status(200).send(readings);
  } catch (error) {
    console.error("Error fetching humidity readings:", error);
    res.status(500).send({
      "status": 500,
      "message": "Error fetching humidity readings: " + error.message
    });
  }
});

module.exports = router;
