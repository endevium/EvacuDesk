const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DistributionRecordSchema = new Schema({
    evacuee_id: { type: Schema.Types.ObjectId, ref: 'Evacuee', required: true },
    evacuation_center_id: { type: Schema.Types.ObjectId, ref: 'EvacuationCenter', required: true },
    stocks: {
        FoodPack: { type: Number, default: 0 },
        WaterPack: { type: Number, default: 0 },
        MedicinePack: { type: Number, default: 0 },
        HygienePack: { type: Number, default: 0 },
        ClothingPack: { type: Number, default: 0 },
        BeddingPack: { type: Number, default: 0 },
        InfantPack: { type: Number, default: 0 }
    },
    status: { type: String, enum: ['Distributed', 'Pending'], default: 'Distributed' }
}, { timestamps: true });

module.exports = mongoose.model('DistributionRecords', DistributionRecordSchema, 'distribution_records');
