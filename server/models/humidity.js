const mongoose = require("mongoose");

const humiditySchema = new mongoose.Schema({
  reading_value: {
    type: Number,
    required: true,
  },
  reading_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  z: {
    type: Number,
    required: true,
  },
  seed_position_x: {
    type: Number,
    required: true,
  },
  seed_position_y: {
    type: Number,
    required: true,
  },
});

const Humidity = mongoose.model("Humidity", humiditySchema);

exports.Humidity = Humidity;