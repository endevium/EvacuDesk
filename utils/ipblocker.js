const BlockedIP = require('../models/BlockedIP');

async function blockIPHit({ ip, user_agent, reason }) {
  await BlockedIP.updateOne(
    { ip, reason }, 
    { $set: { user_agent, timestamp: new Date() } }, 
    { upsert: true }
  );
}

module.exports = { blockIPHit };