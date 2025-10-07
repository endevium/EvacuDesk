const mongoose = require("mongoose");

const EvacuationCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, 
  country: { type: String, default: "Philippines" },
  region: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String },
  capacity: { type: Number, required: true },
  taken_slots: { type: Number, default: 0 },
  staff_name: { type: String, required: true },
  staff_contact_number: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" } 
}, { timestamps: true }); 

module.exports = mongoose.model("EvacuationCenter", EvacuationCenterSchema, "evacuation_centers");
