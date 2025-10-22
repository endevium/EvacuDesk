const webpush = require("web-push");

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails('mailto:evacudesk@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);
  } catch (err) {
    console.error('Failed to set VAPID details for web-push:', err.message || err);
  }
} else {
  console.warn('VAPID keys not set. web-push sendNotification will be a no-op.');
  webpush.sendNotification = async () => {
    return Promise.resolve();
  };
}

module.exports = webpush;
