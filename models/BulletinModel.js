const mongoose = require("mongoose");

const BulletinBoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String, default: null },
  evacuation_center_name: { type: String, required: true },
}, { timestamp: true });

module.exports = mongoose.model("BulletinBoard", BulletinBoardSchema, "bulletin_boards");
