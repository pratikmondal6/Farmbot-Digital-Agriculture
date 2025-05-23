const mongoose = require('mongoose');
const config = require('config'); // ✅ REQUIRED to use config.get()

mongoose.set('strictQuery', false); // preparing for Mongoose 7

module.exports = function () {
    const db = config.get('db');
    mongoose.connect(db)
        .then(() => console.log("✅ Connected to database..."))
        .catch(err => console.log("❌ Cannot connect to database!", err));
};
