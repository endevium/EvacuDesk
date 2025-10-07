const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FamilyMemberSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    birthdate: { type: Date, required: true },
    sex: { type: String, enum: ["male", "female", "other"], required: true }
});

const EvacuationCenterOccupantsSchema = new Schema({
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: 'EvacuationCenter', required: true },
    evacuee_id: { type: Schema.Types.ObjectId, ref: 'Evacuee', required: true },
    date_joined: { type: Date, default: Date.now, required: true },
    date_left: { type: Date, default: null },
    status: { type: String, enum: ['active', 'left'], default: 'active' },
    medical_needs: { type: String },
    number_of_family_members: { type: Number },
    family_members: [FamilyMemberSchema]
}, { timestamps: true });

module.exports = mongoose.model('EvacuationCenterOccupants', EvacuationCenterOccupantsSchema, "evacuation_center_occupants");