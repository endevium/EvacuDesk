const mongoose = require("mongoose");

const EvacuationCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, 
  country: { type: String, default: "Philippines" },
  region: { type: String, required: true },
  province: { type: String, required: true },
  email_address: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  phone_number: { type: String },
  city: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String },
  capacity: { type: Number, required: false },
  taken_slots: { type: Number, default: 0, min: 0 },
  staff_contact_number: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  role: { type: String, enum: ['EvacuationCenter'], default: 'EvacuationCenter' },
}, { timestamps: true }); 

module.exports = mongoose.model("EvacuationCenter", EvacuationCenterSchema, "evacuation_centers");
