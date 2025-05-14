const mongoose = require('mongoose')
const plantscheme = new mongoose.scheme({ // creates scheme for plant
  plant_type: {
    type: String,
    required: true, //If this attribute isn't given you will get an error 
    unique: true, //Same plant_type can't be used twice
    trim: true, //Automaticly deletes blank spaces at the beginning and the end
  },
  minimal_distance: {
    type: Number,
    required: true,
  },
            seeding_depth: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Plant', plantSchema); //creates actual modelout of the scheme