const arcjet = require("@arcjet/node").default;
const { shield, detectBot, tokenBucket } = require("@arcjet/node");
const { triggerCanary } = require("./canary");
const HoneypotLog = require("../models/HoneypotLogs"); 

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
      blockSpoofed: true,
    }),
    tokenBucket({ mode: "LIVE", refillRate: 5, interval: 10, capacity: 10 })
  ],
});

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

     if (decision.isDenied()) {
      // note: ip "::1" = local
      const reasonText = `Arcjet denied: ${decision.reason.type} (${req.ip})`;

      await triggerCanary(reasonText);

      const logEntry = new HoneypotLog({
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        reason: reasonText,
      });
      await logEntry.save();


      if (decision.reason.isRateLimit()) return res.status(429).json({ message: "Too many requests" });
      if (decision.reason.isBot() || decision.reason.isSpoofedBot?.()) return res.status(403).json({ message: "No bots allowed" });
      if (decision.ip?.isHosting() || decision.reason.isHosting?.()) return res.status(403).json({ message: "Hosting providers not allowed" });
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    console.error("Arcjet error:", error);
    return res.status(500).json({ message: "Internal security error" });
  }
};

module.exports = { arcjetMiddleware };
