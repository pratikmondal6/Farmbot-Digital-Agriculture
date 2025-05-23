const mongoose = require('mongoose')
const config = require('config')

module.exports = function () {
    // the `strictQuery` option will be switched back to `false` by default in Mongoose 7. 
    // Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. 
    mongoose.set('strictQuery', false)

    const db = config.get('db')
<<<<<<< HEAD
=======
    console.log(db)
>>>>>>> backend-depth-maike
    mongoose.connect(db)
        .then(() => console.log("Connected to database..."))
        .catch(() => console.log("Cannot connect to database!"))
}
