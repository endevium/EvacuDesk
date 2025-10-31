const mongoose = require('mongoose');

const stockRequestSchema = new mongoose.Schema({
  item_type: { type: String, required: true, enum: ['Food Pack', 'Water Pack', 'Medicine Pack', 'Hygiene Pack', 'Clothing Pack', 'Bedding Pack', 'Infant Pack'] },
  quantity: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('StockRequest', stockRequestSchema, "stock_requests");
