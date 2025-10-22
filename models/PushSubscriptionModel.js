const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, enum: ['Admin', 'EvacuationCenter', 'Evacuee'], required: true },
  subscription: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema, 'push_subscriptions');
