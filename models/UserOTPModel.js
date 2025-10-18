const mongoose = require("mongoose");

const UserOTPSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'role' },
  role: { type: String, enum: ["Admin", "EvacuationCenter", "Evacuee" ], required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserOTP", UserOTPSchema, "user_otps");
