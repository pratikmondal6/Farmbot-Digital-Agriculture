const mongoose = require('mongoose');
mongoose.set('strictQuery', true); // or false, depending on your preference

module.exports = function () {
  mongoose.connect('mongodb://localhost:27017/planttypes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));
};
