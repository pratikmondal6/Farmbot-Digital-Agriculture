const bcrypt = require('bcrypt')
const express = require("express");
const router = express.Router();
const { User } = require("../models/users");
const axios = require('axios');

const sleep = (ms)=> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const move = async (auth_token, position) => {
  // Go to a little higher from seeder object
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Auth-Token': auth_token
  };
  
  await axios.post("http://localhost:5000/move", position, { headers })
    .then(response => {
      console.log('Response:', response.data);
    })
    .catch(error => {
      console.error('Error:', error.response ? error.response.data : error.message);
    });
  await sleep(1000)
}


router.post("/start", async (req, res) => {
  if (!req.headers["auth-token"]) {
    return res.status(401).send({
      "status": 401,
      "message": "Not authorized.",
    })
  }

  // Go to higher than seeder object
  await move(req.headers["auth-token"], {x: 2630, y: 245, z:-395})

  // Go down to get seeder object
  await move(req.headers["auth-token"], {x: 2630, y: 245, z:-410})

  // Go a little outside to take it out
  await move(req.headers["auth-token"], {x: 2500, y: 245, z:-410})

  // Go to a little higher from seed
  await move(req.headers["auth-token"], {x: 2130, y: 25, z:-410})

  // Go down to get seed
  await move(req.headers["auth-token"], {x: 2130, y: 25, z:-520})

  // Start suction

  // Go higher
  await move(req.headers["auth-token"], {x: 2130, y: 25, z:-480})

  // Go to location of seeding
  await move(req.headers["auth-token"], {x: req.body.x, y: req.body.y, z:-480})

  // Go down and seed
  await move(req.headers["auth-token"], {x: req.body.x, y: req.body.y, z:-520 - req.body.z})

  // Stop suction

  // Go up
  await move(req.headers["auth-token"], {x: req.body.x, y: req.body.y, z:-480})

  // Go to left of seeder position
  await move(req.headers["auth-token"], {x: 2500, y: 245, z:-410})

  // Go to seeder position
  await move(req.headers["auth-token"], {x: 2630, y: 245, z:-410})

  // Go up to release it
  await move(req.headers["auth-token"], {x: 2630, y: 245, z:-395})

  res.send({"message": "okay"})
});


module.exports = router;
