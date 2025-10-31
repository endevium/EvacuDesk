const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");

// db connection
const connectDB = asyncHandler (async () => {
    await mongoose.connect("mongodb://localhost:27017/evacudesk_db");
});

module.exports = connectDB;
