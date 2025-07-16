const express = require("express");
const router = express.Router();

router.get("/ml/:amount", async (req, res) => {
  try {
    const amount = parseFloat(req.params.amount) * 10
    res.status(200).send({
      type: "ms",
      result: amount
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/ms/:amount", async (req, res) => {
  try {
    const amount = parseFloat(req.params.amount) / 10
    res.status(200).send({
      type: "ml",
      result: amount
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
