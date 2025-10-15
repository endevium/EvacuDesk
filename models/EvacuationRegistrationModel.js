const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FamilyMemberSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    birthdate: { type: Date, required: true },
    sex: { type: String, enum: ["male", "female", "other"], required: true }
});

const EvacuationRegistrationSchema = new Schema({
    evacuee_id: { type: Schema.Types.ObjectId, ref: "Evacuee", required: true },
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: "EvacuationCenter", required: true },
    number_of_family_members: { type: Number, required: true },
    family_members: [FamilyMemberSchema],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  }, { timestamps: true }
);

module.exports = mongoose.model("EvacuationRegistration", EvacuationRegistrationSchema, "evacuation_registrations");
