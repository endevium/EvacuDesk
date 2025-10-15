const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// family members 
const familyMemberSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  age: { type: Number, required: true },
  sex: { type: String, enum: ["male", "female", "other"], required: true }
});

// evacuee registration with family members 
const evacueeRegistrationSchema = new Schema(
  {
    evacuee_id: { type: Schema.Types.ObjectId, ref: "Evacuee", required: true },
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: "EvacuationCenter", required: true },
    number_of_family_members: { type: Number, required: true },
    family_members: [familyMemberSchema],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  }, { timestamps: true }
);

module.exports = mongoose.model("EvacueeRegistration", evacueeRegistrationSchema, "evacuee_registrations");
