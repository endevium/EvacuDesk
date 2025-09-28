const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ['Medical', 'Food', 'Shelter', 'Clothing', 'Other'], required: true },
    location: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium', required: true },
    }, { timestamps: true });

module.exports = mongoose.model("Request", userSchema);
