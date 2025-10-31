const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockSchema = new Schema({
  source: { type: String, required: true, enum: ['Admin', 'EvacuationCenter'] },
  evacuation_center_id: { type: Schema.Types.ObjectId, refPath: 'source', required: true },
  stocks: {
    FoodPack: { type: Number, default: 0 },
    WaterPack: { type: Number, default: 0 },
    MedicinePack: { type: Number, default: 0 },
    HygienePack: { type: Number, default: 0 },
    ClothingPack: { type: Number, default: 0 },
    BeddingPack: { type: Number, default: 0 },
    InfantPack: { type: Number, default: 0 }
  },
  status: {
    FoodPack: { type: String, default: 'Available' },
    WaterPack: { type: String, default: 'Available' },
    MedicinePack: { type: String, default: 'Available' },
    HygienePack: { type: String, default: 'Available' },
    ClothingPack: { type: String, default: 'Available' },
    BeddingPack: { type: String, default: 'Available' },
    InfantPack: { type: String, default: 'Available' }
  },
  last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

// update stock status by quantity
StockSchema.pre('save', function (next) {
  const stockItems = this.stocks || {};
  const status = {};

  for (const [item, qty] of Object.entries(stockItems)) {
    if (qty === 0) status[item] = 'Out of Stock';
    else if (qty <= 50) status[item] = 'Low Stock';
    else status[item] = 'Available';
  }

  this.status = status;
  this.last_updated = new Date();
  next();
});

module.exports = mongoose.model('Stocks', StockSchema, 'stock_records');
