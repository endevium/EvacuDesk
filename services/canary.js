const axios = require("axios");

const triggerCanary = async (reason = "unknown") => {
  try {
    await axios.get(process.env.CANARY_URL, {
      params: { reason, time: new Date().toISOString() },
      timeout: 2000,
    });
  } catch (err) {
    console.error("Failed to trigger canary:", err.message);
  }
};

module.exports = { triggerCanary };
