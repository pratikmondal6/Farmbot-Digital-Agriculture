const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workspacesheme = new Schema ({
    area_id: {
        type: Number,
        required: true,
        unique: true,
        trim: true,
    },
    a_1: {
        type: Number,
        required: true,
    },
    a_2: {
        type: Number,
        required: true,
    },
    b_1: {
        type: Number,
        required: true,
    },
    b_2: {
        type: Number,
        required: true,
    },
})

module.exports = mongoose.model('Workspace', qorkspacescheme);