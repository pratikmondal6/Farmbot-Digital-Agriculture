const express = require("express");
const { Farmbot } = require("farmbot");
const router = express.Router();

// One-time request handler
router.get("/", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  const token = req.headers["auth-token"];
  const bot = new Farmbot({ token });

  // Wait for connection and first position update
  let resolved = false;

  const timeout = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      res.status(504).json({ error: "Timeout: No position received." });
    }
  }, 5000); // 5 seconds timeout

  bot.on("status", (status) => {
    const pos = status.location_data?.position;
    if (!resolved && pos?.x != null && pos?.y != null && pos?.z != null) {
      resolved = true;
      clearTimeout(timeout);
      res.json(pos);
    }
  });

  bot.on("error", (err) => {
    if (!resolved) {
      resolved = true;
      clearTimeout(timeout);
      res.status(500).json({ error: "FarmBot connection error", detail: err });
    }
  });

  try {
    await bot.connect();
  } catch (err) {
    if (!resolved) {
      resolved = true;
      clearTimeout(timeout);
      res.status(500).json({ error: "Failed to connect to FarmBot", detail: err.message });
    }
  }
});

module.exports = router;
