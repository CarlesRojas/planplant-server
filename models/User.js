const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 12,
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 256,
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
    homeName: {
        type: String,
        min: 3,
        max: 12,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    settings: {
        vibrate: {
            type: Boolean,
            default: true,
        },
    },
});

module.exports = mongoose.model("User", userSchema);
