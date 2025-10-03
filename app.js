const express = require("express");
const connectDB = require("./config/dbconnection");

const app = express();
connectDB();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// main starting routes
app.use("/evacuee", require("./routes/EvacueeRoute"));
app.use("/admin", require("./routes/AdminRoute")); 
app.use("/staff", require("./routes/StaffRoute"));
app.use("/evacuation-center", require("./routes/EvacuationCenterRoute"));
app.use("/evacuation-center-occupants", require("./routes/EvacuationCenterOccupantsRoute"));
app.use("/evacuee-registration", require("./routes/EvacueeRegistrationRoute"));

module.exports = app;
