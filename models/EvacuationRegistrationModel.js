const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EvacuationRegistrationSchema = new Schema({
    evacuee_id: { type: Schema.Types.ObjectId, ref: "Evacuee", required: true },
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: "EvacuationCenter", required: true },
    number_of_family_members: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    isActive: { type: Boolean, default: true },
    pwd: { type: Number, default: 0, min: 0 },
    seniors: { type: Number, default: 0, min: 0 },
    teens: { type: Number, default: 0, min: 0},
    infants: { type: Number, default: 0, min: 0},
    pregnant: { type: Number, default: 0, min: 0 },
    childrens: { type: Number, default: 0, min: 0 },
    adults: {  type: Number, default: 0, min: 0 },
    priority_level: { type: Number },
    for_pickup: { type: String, enum: ["Yes", "No"], default: "No", required: true},
    pickup_status: { type: String, enum: ["Awaiting Pickup", "Picked Up"], default: "Awaiting Pickup" }
  }, { timestamps: true }
);

module.exports = mongoose.model("EvacuationRegistration", EvacuationRegistrationSchema, "evacuation_registrations");
