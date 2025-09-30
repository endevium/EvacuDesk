const express = require("express");
const connectDB = require("./config/dbconnection");

const app = express();

connectDB();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// main starting routes
app.use("/evacuee", require("./routes/evacueeRoute"));
app.use("/admin", require("./routes/adminRoute")); 
app.use("/staff", require("./routes/staffRoute"));

module.exports = app;
