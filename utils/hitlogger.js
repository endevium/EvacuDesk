const HoneypotLog = require('../models/HoneypotLogs');

async function recordHit({ ip, user_agent, reason }) {
  await HoneypotLog.updateOne(
    { ip, reason },                
    { $set: { user_agent, timestamp: new Date() } }, 
    { upsert: true }          
  );
}

module.exports = { recordHit };
