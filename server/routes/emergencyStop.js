const express = require("express");
const router = express.Router();
const { Farmbot } =  require("farmbot");

// Stop the bot
router.get("/stop", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });
  await bot.connect()

  bot.emergencyLock()

  return res.status(200).send({message: "Bot is stopped"})
});

// Unlock the bot
router.get("/unlock", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });
  await bot.connect()

  await bot.emergencyUnlock()

  return res.status(200).send({message: "Bot is unlocked"})
});


module.exports = router;
