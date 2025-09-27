const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/evacudesk_db");
    console.log("db connected");
  } catch (err) {
    console.error("db connection failed", err);
    process.exit(1);
  }
};

module.exports = connectDB;
