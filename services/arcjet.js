import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),

    detectBot({
      mode: "LIVE", 
      allow: [
        "CATEGORY:SEARCH_ENGINE", 
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
      ],
    }),

    tokenBucket({
      mode: "LIVE",
      refillRate: 5,   
      interval: 10,    
      capacity: 10,    
    }),
  ],
});

export const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Too Many Requests" });
      }

      if (decision.reason.isBot() || decision.reason.isSpoofedBot?.()) {
        return res.status(403).json({ message: "No bots allowed" });
      }

      if (decision.ip?.isHosting()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    console.error("Arcjet error:", error);
    next();
  }
};
