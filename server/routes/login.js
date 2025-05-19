const bcrypt = require('bcrypt')
const express = require("express");
const router = express.Router();
const { User } = require("../models/users");

router.post("/", async (req, res) => {
  let user = await User.findOne({ email: req.body.email.trim().toLowerCase() });
  if (!user)
    return res.status(401).send({
      "status": 401,
      "message": "Invalid email or password.",
    });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(401).send({
      "status": 401,
      "message": "Invalid email or password.",
    });

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .cookie("x-auth-token", token, {
      // httpOnly: true,
      // secure: true,
      maxAge: 3600000,
    })
    .status(200).send({
      "status": 200,
      "message": "Logged in successfully",
      "email": req.body.email.trim().toLowerCase(),
      "x-auth-token": token
    });
});


module.exports = router;
