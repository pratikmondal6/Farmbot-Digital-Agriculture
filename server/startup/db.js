const mongoose = require('mongoose')
const config = require('config')

module.exports = function () {
    // the `strictQuery` option will be switched back to `false` by default in Mongoose 7. 
    // Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. 
    mongoose.set('strictQuery', false)

    const db = config.get('db')
    mongoose.connect(db)
        .then(() => console.log("Connected to database..."))
        .catch(() => console.log("Cannot connect to database!"))
}

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