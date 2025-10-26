const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HoneypotLogSchema = new Schema({
  ip: { type: String, required: true },
  user_agent: { type: String },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true }); 

module.exports = mongoose.model('HoneypotLog', HoneypotLogSchema, 'honeypot_logs');
