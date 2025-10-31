const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new mongoose.Schema({
    item_type: { type: String, required: true, enum: ['Food Pack', 'Water Pack', 'Medicine Pack', 'Hygiene Pack', 'Clothing Pack', 'Bedding Pack', 'Infant Pack']},
    quantity: { type: Number, required: true, min: 0 },
    source: { type: String, required: true, enum: ['Admin', 'EvacuationCenter'] },
    location_id: { type: Schema.Types.ObjectId, refPath: 'source', required: true },
    status: { type: String, enum: ['Available', 'Low Stock', 'Out of Stock'], default: 'Available' }
}, { timestamps: true });

// stock status update by quantity
stockSchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= 50) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
