const mongoose = require("mongoose");

const UserTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, enum: ["admin", "staff", "evacuee"], required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" }
});

module.exports = mongoose.model("UserToken", UserTokenSchema, "user_tokens");
