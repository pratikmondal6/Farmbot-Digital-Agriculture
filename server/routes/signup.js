const bcrypt = require('bcrypt')
const express = require("express");
const router = express.Router();
const { User } = require("../models/users");


router.post("/", async (req, res) => {
  const user = await User.find({ email: req.body.email.trim().toLowerCase() });
  if (user.length != 0) {
    res.status(409).send({
      "status": 409,
      "message": "User with the same email exists"
    })
  } else {
    const user = new User({
      email: req.body.email.trim().toLowerCase(),
      password: req.body.password.trim(),
    });

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    await user.save();

    res.status(200).send({
      "status": 200,
      "message": "You registered successfully. Login with your information.",
    })
  }
});

module.exports = router;
