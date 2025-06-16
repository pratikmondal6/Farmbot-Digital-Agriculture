const mongoose = require("mongoose");

const seedSchema = new mongoose.Schema({
  seed_name: {
    type: String,
    require: true,
  },
  seeding_date: {
    type: Date,
    required: true,
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
    require: true,
  },
});

const Seed = mongoose.model("Seed", seedSchema);

exports.Seed = Seed;
