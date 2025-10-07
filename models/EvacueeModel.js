const mongoose = require("mongoose");

const EvacueeSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    street_number: { type: String, required: true },
    barangay: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, default: "Philippines" },
    phone_number: { type: String },
    sex: { type: String, enum: ['male', 'female', 'other'], required: true },
    birthdate: { type: Date, required: true },
    disabilities: { type: String },
    id_picture: { type: String, required: true },
    role: { type: String, enum: ['evacuee', 'staff', 'admin'], default: 'evacuee' },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "EvacuationCenter", default: null }
}, { timestamps: true });

module.exports = mongoose.model("Evacuee", EvacueeSchema);
