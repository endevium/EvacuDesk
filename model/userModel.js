const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    last_name: { type: String, required: true },
    first_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Evacuess', 'user'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
