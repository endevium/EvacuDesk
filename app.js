const express = require("express");
const connectDB = require("./config/dbconnection");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => res.send("API is running"));

// Routes
app.use("/user", require("./routes/userRoute"));

module.exports = app;
