const mongoose = require('mongoose');
const Plant = require('./models/plan');
// todo: add db name here
mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME'); // Change to your DB

const defaultPlants = [
  { plant_type: 'Radishes' },
  { plant_type: 'Lettuce' },
  { plant_type: 'Carrots' },
  { plant_type: 'Beets' },
  { plant_type: 'Peas' },
  { plant_type: 'Beans' },
  { plant_type: 'Kohlrabi' },
  { plant_type: 'Fennel' },
  { plant_type: 'Pumpkin' },
  { plant_type: 'Zucchini' }
];

Plant.insertMany(defaultPlants)
  .then(() => {
    console.log('Default plant types inserted');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });