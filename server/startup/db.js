const mongoose = require('mongoose');
mongoose.set('strictQuery', true); // or false, depending on your preference

module.exports = function () {
<<<<<<< HEAD
    // the `strictQuery` option will be switched back to `false` by default in Mongoose 7. 
    // Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. 
    mongoose.set('strictQuery', false)

    const db = config.get('db')
    mongoose.connect(db)
        .then(() => console.log("Connected to database..."))
        .catch(() => console.log("Cannot connect to database!"))
}
=======
  mongoose.connect('mongodb://localhost:27017/planttypes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));
};
>>>>>>> b8b0405290688515b26becffa0794bc5edfed96c
