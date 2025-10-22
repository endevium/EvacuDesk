const PushSubscription = require('../models/PushSubscriptionModel');

exports.createSubscription = async (req, res) => {
  try {
    const { user_id, role, subscription } = req.body;
    if (!user_id || !role || !subscription) return res.status(400).json({ error: 'Missing required fields' });

    await PushSubscription.findOneAndUpdate({ user_id, role }, { subscription }, { upsert: true });
    res.status(201).json({ message: 'Subscription saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const { user_id, role } = req.body;
    if (!user_id || !role) return res.status(400).json({ error: 'Missing required fields' });

    await PushSubscription.deleteOne({ user_id, role });
    res.json({ message: 'Subscription deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
