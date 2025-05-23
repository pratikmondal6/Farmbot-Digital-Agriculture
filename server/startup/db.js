const mongoose = require('mongoose');
const config = require('config');

mongoose.set('strictQuery', false);

module.exports = function () {
    const db = config.get('db');
    // the `strictQuery` option will be switched back to `false` by default in Mongoose 7. 
    // Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. 
    mongoose.set('strictQuery', false);

    console.log(db);
    mongoose.connect(db)
        .then(() => console.log("✅ Connected to database..."))
        .catch(err => console.log("❌ Cannot connect to database!", err));
};
