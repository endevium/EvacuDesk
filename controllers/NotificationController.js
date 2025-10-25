const Notification = require('../models/NotificationModel');
const PushSubscription = require('../models/PushSubscriptionModel');
const { sendToUser, broadcastToRole } = require('../services/io'); 
const webpush = require('../services/webpush');

async function createNotification({ title, body, recipient_id, recipient_role, meta = {} }) {
  const notification = await Notification.create({
    title,
    body,
    recipient_id,
    recipient_role,
    meta,
    created_at: new Date(),
  });

  const payload = {
    title,
    body,
    ...meta,
  };

  // socket.io notifications
  if (recipient_id) {
    console.log('Sending socket notification to user:', recipient_id);
    sendToUser(recipient_id, payload);
  } else if (recipient_role) {
    console.log('Broadcasting socket notification to role:', recipient_role);
    broadcastToRole(recipient_role, payload);
  }

  // web push notifications
  const subs = await PushSubscription.find({
    ...(recipient_id ? { user_id: recipient_id } : {}),
    ...(recipient_role ? { role: recipient_role } : {}),
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to send web push notification:', err.message || err);
    }
  }

  return notification;
}

module.exports = { createNotification };
