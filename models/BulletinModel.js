const mongoose = require("mongoose");

const BulletinBoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  image: { type: String, default: null },
  evacuation_center_name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BulletinBoard", BulletinBoardSchema, "bulletin_boards");
