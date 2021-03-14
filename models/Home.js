const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
    homeName: {
        type: String,
        required: true,
        min: 3,
        max: 12,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    image: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    users: [
        {
            userName: {
                type: String,
                required: true,
                min: 3,
                max: 12,
            },
            image: {
                type: String,
                required: true,
                min: 6,
                max: 1024,
            },
        },
    ],
});

module.exports = mongoose.model("Home", homeSchema);
