const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockRequestSchema = new Schema({
  evacuation_center_id: { type: Schema.Types.ObjectId, ref: 'EvacuationCenter', required: true },
  stocks: {
    FoodPack: { type: Number, default: 0, min: 0 },
    WaterPack: { type: Number, default: 0, min: 0 },
    MedicinePack: { type: Number, default: 0, min: 0 },
    HygienePack: { type: Number, default: 0, min: 0 },
    ClothingPack: { type: Number, default: 0, min: 0 },
    BeddingPack: { type: Number, default: 0, min: 0 },
    InfantPack: { type: Number, default: 0, min: 0 },
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Received'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('StockRequest', StockRequestSchema, 'stock_requests');
