const express = require("express");
const connectDB = require("./config/dbconnection");

const app = express();

connectDB();

// middleware
app.use(express.json());

// test only
app.get("/", (req, res) => res.send("API is running"));

// routing
app.use("/user", require("./routes/userRoute"));

module.exports = app;
