const mongoose = require("mongoose");

const WateringJobSchema = new mongoose.Schema({
  plantType: String,
  x: Number,
  y: Number,
  z: Number,
  waterAmount: Number,
  date: String,
  interval: Number,
});

module.exports = mongoose.model("WateringJob", WateringJobSchema);