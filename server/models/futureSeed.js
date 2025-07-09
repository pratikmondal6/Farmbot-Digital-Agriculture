const mongoose = require("mongoose");

const futureSeedSchema = new mongoose.Schema({
  seeding_job_id: {
    type: String,
    require: true,
  },
  seed_name: {
    type: String,
    require: true,
  },
  seedX: {
    type: String,
    require: true,
  },
  seedY: {
    type: String,
    require: true,
  },
  x: {
    type: String,
    require: true,
  },
  y: {
    type: String,
    require: true,
  },
  z: {
    type: String,
    required: true,
    default: 50
  }
});

const FutureSeed = mongoose.model("FutureSeed", futureSeedSchema);

exports.FutureSeed = FutureSeed;
