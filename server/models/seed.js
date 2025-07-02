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
  seedX: {
    type: String,
    require: true,
  },
  seedY: {
    type: String,
    require: true,
  },
  topLeft: {
    x: {
      type: String,
      require: true,
    },
    y: {
      type: String,
      require: true,
    }
  },
  topRight: {
    x: {
      type: String,
      require: true,
    },
    y: {
      type: String,
      require: true,
    }
  },
  bottomLeft: {
    x: {
      type: String,
      require: true,
    },
    y: {
      type: String,
      require: true,
    }
  },
  bottomRight: {
    x: {
      type: String,
      require: true,
    },
    y: {
      type: String,
      require: true,
    }
  },
  z: {
    type: String,
    required: true,
    default: 50
  }
});

const Seed = mongoose.model("Seed", seedSchema);

exports.Seed = Seed;
