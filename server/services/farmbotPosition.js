const express = require("express");
const { Farmbot } = require("farmbot");
const router = express.Router();

let currentPosition = {x: 0, y:0, z:0, locked: false}

const updatePosition = () => {
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJ1bmtub3duIiwic3ViIjoxNjA1OSwiaWF0IjoxNzUwODY3MjI4LCJqdGkiOiIzNDVlY2RiMC02MDc0LTQ4NWItYmQ2MC02ZmFjNWE2ZmYxN2IiLCJpc3MiOiIvL215LmZhcm0uYm90OjQ0MyIsImV4cCI6MTc1NjA1MTIyOCwibXF0dCI6ImNsZXZlci1vY3RvcHVzLnJtcS5jbG91ZGFtcXAuY29tIiwiYm90IjoiZGV2aWNlXzE2MDg5Iiwidmhvc3QiOiJ4aWNvbmZ1bSIsIm1xdHRfd3MiOiJ3c3M6Ly9jbGV2ZXItb2N0b3B1cy5ybXEuY2xvdWRhbXFwLmNvbTo0NDMvd3MvbXF0dCJ9.cRXp3tVyO9UYCPtfTyVBAnaFTB261BJDSIxNftlw68v_XBLOOZ7OSqzUPBudyQJRCI0FSVrkmWokKDyF_hVMwDHGd19wZanMB8PNQOrhRfQxeD00CP4vMENhpI_2W8uzynqPanWy-gbNaOeyrV5FEDjHnjlWlXE8v2tSvhXMHaSdRq7UM_GpTkfvr5b3ixrRByGTFKZFvuZJ2k9OrFPRym1aXRdE-4IrM7vwzlFhEDlC2prINIaGa3wq3YGfJXeJrls5H38Gj5tdfcmAdk0qYKGftKbQwj45pWUMns4LKNtgEmmms5dV0PLLh2v8sZ8ATqTSaDFtvreopxcHq8kZnQ"
  const bot = new Farmbot({ token });

  bot.on("status", (status) => {
    if ("location_data" in status && "position" in status.location_data) {
      const position = status.location_data.position;
      currentPosition.x = position.x
      currentPosition.y = position.y
      currentPosition.z = position.z
    }
    if ("informational_settings" in status && "locked" in status.informational_settings) {
      const locked = status.informational_settings.locked;
      currentPosition.locked = locked
    }
  });

  bot.connect()
}

router.get("/", async (req, res) => {
  res.status(200).send(currentPosition)
})

module.exports = {
  router,
  updatePosition
}
