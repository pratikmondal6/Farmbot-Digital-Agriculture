const { Farmbot } = require("farmbot");
const express = require("express");
const router = express.Router();
const { setJobStatus } = require("../services/farmbotStatusService");

// Helper function to move the bot
const move = async (bot, coordinates) => {
  try {
    const moveCoordinates = {
      speed: 100,
      ...coordinates
    };
    
    await bot.moveAbsolute(moveCoordinates);
  } catch (error) {
    console.error('Move error:', error);
    throw error;
  }
};

// Helper function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Constants for soil sensor storage position
const STORAGE_POSITION = {
  SAFE_HEIGHT: 0,
  STORAGE_X: 2630,
  STORAGE_Y: 350,
  STORAGE_Z: -410
};

router.post("/return-home", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    });
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });

  try {
    // Connect to the Farmbot
    await bot.connect();
    setJobStatus("returning sensor to storage position");

    // Step 1: Move to safe height first
    await move(bot, { z: STORAGE_POSITION.SAFE_HEIGHT });
    await sleep(1000);

    // Step 2: Move above storage position
    await move(bot, {
      x: STORAGE_POSITION.STORAGE_X,
      y: STORAGE_POSITION.STORAGE_Y,
      z: STORAGE_POSITION.SAFE_HEIGHT
    });
    await sleep(1000);

    // Step 3: Lower to storage position
    await move(bot, {
      x: STORAGE_POSITION.STORAGE_X,
      y: STORAGE_POSITION.STORAGE_Y,
      z: STORAGE_POSITION.STORAGE_Z
    });

    setJobStatus("Finished");
    setTimeout(() => {
      setJobStatus("online");
    }, 3000);

    return res.status(200).send({
      "status": 200,
      "message": "Soil sensor returned to storage position successfully"
    });
  } catch (error) {
    console.error("Error returning soil sensor:", error);
    setJobStatus("error");
    return res.status(500).send({
      "status": 500,
      "message": "An error occurred while returning soil sensor to storage position: " + error.message
    });
  }
});

module.exports = router;