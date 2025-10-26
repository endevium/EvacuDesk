const BlockedIP = require('../models/BlockedIP');

async function ipBlockMiddleware(req, res, next) {
  try {
    // get ip
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;

    if (!ip) return next();

    // check if ip in blocklist
    const blocked = await BlockedIP.exists({ ip });
    if (blocked) {
      return res.status(403).json({ message: 'Access blocked' });
    }

    next();
  } catch (error) {
    console.error('Error in IP block middleware:', error);
    next(); 
  }
}

module.exports = ipBlockMiddleware;
