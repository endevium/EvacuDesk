const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlockedIPSchema = new Schema({
  ip: { type: String, unique: true, required: true },
  reason: { type: String },
  blockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlockedIP', BlockedIPSchema, 'blocked_ips');
