const express = require("express");
const connectDB = require("./config/dbconnection");

const app = express();

connectDB();

app.use(express.json());

// main starting routes
app.use("/user", require("./routes/userRoute"));
// app.use("/request", require("./routes/requestRoute"));

module.exports = app;
