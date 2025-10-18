const mongoose = require("mongoose");

// db connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/evacudesk_db");
  } 
  catch (err) {
    console.error("Connection failed", err);
    process.exit(1);
  }
};

module.exports = connectDB;
