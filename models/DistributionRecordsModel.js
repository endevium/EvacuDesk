const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DistributionRecordSchema = new Schema({
    evacuee_id: { type: Schema.Types.ObjectId, ref: 'Evacuee', required: true },
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: 'EvacuationCenter', required: true },
    relief_type: { type: String, required: true, enum : ['Food Pack', 'Water Pack', 'Medicine Pack', 'Hygiene Pack', 'Clothing Pack', 'Bedding Pack', 'Infant Pack'] },
    quantity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DistributionRecords', DistributionRecordSchema, 'distribution_records');
