const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const evacuationCenterOccupantsSchema = new Schema({
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: 'EvacuationCenter', required: true },
    evacuee_id: { type: Schema.Types.ObjectId, ref: 'Evacuee', required: true },
    date_joined: { type: Date, default: Date.now, required: true },
    date_left: { type: Date, default: null },
    status: { type: String, enum: ['active', 'left'], default: 'active' },
    // pending, approved, rejected
    // pag nag left yung occupant, delete occupant nalang kesa lagyan ng left status?
    // pag naging occupant na sila hindi na ata kelangan ng pending, approved, rejected
    medical_needs: { type: String },
    // number_of_family_members: { type: Number }
    // need ata yung fam quantity pag naging occupant kana?
}, { timestamps: true });

module.exports = mongoose.model('EvacuationCenterOccupants', evacuationCenterOccupantsSchema, "evacuation_center_occupants");