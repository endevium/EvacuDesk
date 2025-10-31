const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EvacuationCenterOccupantsSchema = new Schema({
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: 'EvacuationCenter', required: true },
    evacuee_id: { type: Schema.Types.ObjectId, ref: 'Evacuee', required: true, ref: 'Evacuee' },
    date_joined: { type: Date, default: Date.now, required: true },
    date_returned: { type: Date, default: null },
    status: { type: String, enum: ['Active', 'Returned'], default: 'Active', required: true },
    medical_needs: { type: String },
    number_of_family_members: { type: Number },
    pwd: { type: Number, default: 0, min: 0 },
    seniors: { type: Number, default: 0, min: 0 },
    teens: { type: Number, default: 0, min: 0},
    infants: { type: Number, default: 0, min: 0},
    pregnant: { type: Number, default: 0, min: 0 },
    childrens: { type: Number, default: 0, min: 0 },
    adults: {  type: Number, default: 0, min: 0 },
    priority_level: { type: Number },
    assigned_area: { type: mongoose.Schema.Types.ObjectId, ref: 'CenterArea', default: null },
}, { timestamps: true });

module.exports = mongoose.model('EvacuationCenterOccupants', EvacuationCenterOccupantsSchema, "evacuation_center_occupants");