import { set, connect } from 'mongoose'
import { get } from 'config'

export default function () {
    // the `strictQuery` option will be switched back to `false` by default in Mongoose 7. 
    // Use `mongoose.set('strictQuery', false);` if you want to prepare for this change. 
    set('strictQuery', false)

    const db = get('db')
    connect(db)
        .then(() => console.log("Connected to database..."))
        .catch(() => console.log("Cannot connect to database!"))
}
