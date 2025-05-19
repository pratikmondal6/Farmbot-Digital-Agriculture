const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(404).send({
    status: 404,
    message: "Page not found"
  });
});

module.exports = router;
