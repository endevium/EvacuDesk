const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  recipient_id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
  recipient_role: { type: String, enum: ['Admin', 'EvacuationCenter', 'Evacuee'], required: true },
  read: { type: Boolean, default: false },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema, 'user_notifications');
