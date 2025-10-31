require("dotenv").config(); 
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbconnection");
const app = express();
const { arcjetMiddleware } = require("./services/arcjet");
const BlockedIPMiddleware = require("./middlewares/blockedIP");
const errorHandler = require('./middlewares/errorHandler');
const sanitizer = require("./middlewares/sanitizer");

app.use(cors());
app.use(express.json());
app.use(sanitizer);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static("uploads"));

connectDB();

// app.use(BlockedIPMiddleware);
app.use(arcjetMiddleware);

// main starting routes
app.use("/", require("./routes/HoneyRoute"));
app.use("/evacuee", require("./routes/EvacueeRoute"));
app.use("/admin", require("./routes/AdminRoute")); 
app.use("/auth", require("./routes/AuthRoute"));
app.use("/evacuation-center", require("./routes/EvacuationCenterRoute"));
app.use("/evacuation-center-occupant", require("./routes/EvacuationCenterOccupantsRoute"));
app.use("/evacuation-registration", require("./routes/EvacuationRegistrationRoute"));
app.use("/evacuee-request", require("./routes/StockRequestRoute"));
app.use("/bulletin", require("./routes/BulletinRoute"));
app.use("/dashboard", require("./routes/DashboardRoute"));
app.use("/notification", require("./routes/NotificationRoute"));
app.use("/push-subscription", require("./routes/PushSubscriptionRoute"));
app.use("/center-area", require("./routes/CenterAreaRoute"));
app.use("/distribution-record", require("./routes/DistributionRecordsRoute"));
app.use("/stock", require("./routes/StocksRoute"))
app.use("/stock-request", require("./routes/StockRequestRoute"))

app.use(errorHandler);

module.exports = app;
