import { scheme, model } from 'mongoose';
const plantscheme = new scheme({ // creates scheme for plant
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

export default model('Plant', plantscheme); //creates actual modelout of the scheme