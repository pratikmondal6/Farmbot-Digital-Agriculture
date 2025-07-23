const axios = require('axios')
const express = require("express");
const router = express.Router();

const checkMovableArea = async (x, y, z, absolute) => {
  console.log("Checking movable area")
  console.log(x, y, z, absolute)
  const response = await axios.get("http://localhost:5001/farmbotPosition")
  const currentPosition = response.data

  let destination = {x: 0, y: 0, z: 0}
  if (absolute) {
    destination.x = x
    destination.y = y
    destination.z = z
  }
  else {
    destination.x = currentPosition.x + x
    destination.y = currentPosition.y + y
    destination.z = currentPosition.z + z
  }

  if (destination.x > 2500 && ((destination.y > 50 && destination.y < 450) || (destination.y > 760 && destination.y < 1160)) && destination.z < -410) {
    console.log(false)
    return false
  }
  console.log(true)
  return true
}

router.get("/absolute", async (req, res) => {
  res.status(200).send(checkMovableArea(req.body.x, req.body.y, req.body.z, absolute=true))
})

router.get("/relative", async (req, res) => {
  res.status(200).send(checkMovableArea(req.body.x, req.body.y, req.body.z, absolute=false))
})

module.exports = {
  checkMovableArea,
  router
}
