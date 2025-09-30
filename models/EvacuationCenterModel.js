const mongoose = require("mongoose");

const evacuationCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, 
  address: { type: String, required: true },
  capacity: { type: Number, required: true },
  taken_slots: { type: Number, default: 0 },
  staff_name: { type: String, required: true },
  staff_contact_number: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" } 
}, { timestamps: true }); 

module.exports = mongoose.model("EvacuationCenter", evacuationCenterSchema, "evacuation_centers");
