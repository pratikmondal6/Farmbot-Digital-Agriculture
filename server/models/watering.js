const mongoose = require("mongoose");

const WateringJobSchema = new mongoose.Schema({
  plantType: String,
  x: Number,
  y: Number,
  z: Number,
  waterAmount: Number,
  waterUnit: String, 
  date: String,
  interval: Number,
  lastWateredDate: String
});

module.exports = mongoose.model("WateringJob", WateringJobSchema);