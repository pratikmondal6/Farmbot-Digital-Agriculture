const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plantscheme = new Schema({
  plant_type: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  minimal_distance: {
    type: Number,
    required: false, // must be false or omitted
  },
  seeding_depth: {
    type: Number,
    required: false, // must be false or omitted
  },
});

module.exports = mongoose.model('Plant', plantscheme);