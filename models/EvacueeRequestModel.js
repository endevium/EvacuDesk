const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EvacueeRequestSchema = new Schema({
  evacuee_id: { type: Schema.Types.ObjectId, ref: 'Evacuee', required: true },
  evacuation_center_id: { type: Schema.Types.ObjectId, ref: 'EvacuationCenter', required: true },
  request_type: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Fulfilled', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('EvacueeRequest', EvacueeRequestSchema, 'evacuee_requests');
