const { Farmbot } =  require("farmbot");
const express = require("express");
const router = express.Router();
const { setJobStatus } = require("../services/farmbotStatusService");


router.post("/", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });

  if (req.body.x === undefined && req.body.y === undefined && req.body.z === undefined) {
    return res.status(500).send({
      "status": 500,
      "message": "x, y and z is not sent in body"
    })
  }

  let x = 0;
  let y = 0;
  let z = 0;

  if (req.body.x) {
    x = req.body.x;
  }

  if (req.body.y) {
    y = req.body.y;
  }

  if (req.body.z) {
    z = req.body.z;
  }

  bot
    .connect()
    .then(async () => {
      setJobStatus("moving to target position");
      await bot.moveRelative({ x: x, y: y, z: z, speed: 100 });
      setJobStatus("Finished");
      setTimeout(() => {
        setJobStatus("online");
      }, 3000);
      return res.status(200).send({
        "status": 200,
        "message": "Farmbot moved successfully"
      })
    })
    .catch((error) => {
      setJobStatus("error")
      return res.status(500).send({
        "status": 500,
        "message": "An error occured while moving the bot: " + error
      })
    });
});

module.exports = router;
