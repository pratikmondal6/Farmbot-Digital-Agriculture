const bcrypt = require('bcrypt')
const express = require("express");
const router = express.Router();
const { User } = require("../models/users");
const axios = require('axios');


router.post("/", async (req, res) => {
  console.log({
        email: req.body.email.trim(),
        password: req.body.password
      })
  axios.post('https://my.farm.bot/api/tokens', {
      user: {
        email: req.body.email.trim(),
        password: req.body.password
      }
    })
    .then(response => {
      res.status(200).send({
        "status": 200,
        "message": "Logged in successfully",
        "token": response.data.token.encoded
      })
    })
    .catch(error => {
      res.status(401).send({
        "status": 401,
        "message": error.message,
      })
    });
});


module.exports = router;
