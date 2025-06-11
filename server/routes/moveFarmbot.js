const { Farmbot } =  require("farmbot");
const express = require("express");
const router = express.Router();


router.post("/", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });

  if (!req.body.x && !req.body.x && !req.body.z) {
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
      await bot.moveAbsolute({ x: x, y: y, z: z, speed: 100 });
      return res.status(200).send({
        "status": 200,
        "message": "Farmbot moved successfully"
      })
    })
    .catch((error) => {
      return res.status(500).send({
        "status": 500,
        "message": "An error occured while moving the bot: " + error
      })
    });
});

module.exports = router;
