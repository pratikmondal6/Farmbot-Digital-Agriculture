const mongoose = require("mongoose");

const seedingPointsDistributionSchema = new mongoose.Schema({
  distribution: {
    type: String,
    enum: ['efficient', 'normal', 'hexagonal'],
    require: true,
  },
});

const SeedingPointsDistribution = mongoose.model("SeedingPointsDistribution", seedingPointsDistributionSchema);

exports.SeedingPointsDistribution = SeedingPointsDistribution;
