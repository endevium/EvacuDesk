const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  item_name: { type: String, required: true, trim: true },
  item_type: { type: String, required: true, enum: ['Food Pack', 'Water Pack', 'Medicine Pack', 'Hygiene Pack', 'Clothing Pack', 'Bedding Pack', 'Infant Pack'] },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'pcs' },
  source: { type: String, required: true, enum: ['Admin', 'EvacuationCenter'] },
  location_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'sourceModel', required: true },
  sourceModel: { type: String, required: true, enum: ['Admin', 'EvacuationCenter'] },
  expiry_date: { type: Date },
  last_updated: { type: Date, default: Date.now },
  status: { type: String, enum: ['Available', 'Low Stock', 'Out of Stock'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
