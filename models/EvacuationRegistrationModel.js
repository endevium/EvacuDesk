const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EvacuationRegistrationSchema = new Schema({
    evacuee_id: { type: Schema.Types.ObjectId, ref: "Evacuee", required: true },
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: "EvacuationCenter", required: true },
    number_of_family_members: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
  }, { timestamps: true }
);

module.exports = mongoose.model("EvacuationRegistration", EvacuationRegistrationSchema, "evacuation_registrations");
