const { Farmbot } =  require("farmbot");
const express = require("express");
const router = express.Router();


router.get("/", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  const token = req.headers["auth-token"];
  let bot = new Farmbot({ token: token });

  let responded = false;

  bot.connect()
  bot.on("status", (status) => {
    const pos = status;
    console.log("Live position:", pos); // {x, y, z}
    res.send({"okay": "okay"})
  });

  // try {
  //   await bot.connect();

  //   bot.on("status", (status) => {
  //     if (!responded) {
  //       responded = true;
  //       console.log("Live position:", status);
  //       res.send({ okay: "okay", position: status });
  //     }
  //   });

  // } catch (err) {
  //   res.status(500).send({ error: "Connection failed", details: err.message });
  // }


  
  // await bot.on("status", (status) => {
  //   const pos = status;
  //   console.log(pos)
  //   res.send(pos)
  // });

  // bot.connect()

  // bot
  //   .connect()
  //   .then(() => {
  //     bot.on("status", (status) => {
  //       const pos = status;
  //       console.log("Live position:", pos); // {x, y, z}
  //       res.status(200).send({
  //         "status": 200,
  //         "position": pos
  //       })
  //     });      
  //   })
  //   .catch((error) => {
  //     return res.status(500).send({
  //       "status": 500,
  //       "message": "An error occured while getting the bot position: " + error
  //     })
  //   });
});

module.exports = router;
