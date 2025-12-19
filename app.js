require("dotenv").config(); 
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const Tokens = require("csrf");
const connectDB = require("./config/dbconnection");
const app = express();
const { arcjetMiddleware } = require("./services/arcjet");
const BlockedIPMiddleware = require("./middlewares/blockedIP");
const errorHandler = require('./middlewares/errorHandler');
const sanitizer = require("./middlewares/sanitizer");

const isProd = process.env.NODE_ENV === "production";
const tokens = new Tokens();
const safeMethods = ["GET", "HEAD", "OPTIONS", "TRACE"];
const csrfSecretCookie = "csrf-secret";

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(sanitizer);
app.use((req, res, next) => {
  let secret = req.cookies[csrfSecretCookie];
  if (!secret) {
    secret = tokens.secretSync();
    res.cookie(csrfSecretCookie, secret, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
    });
  }

  const token = tokens.create(secret);

  if (!safeMethods.includes(req.method)) {
    const submitted = req.headers["x-csrf-token"];
    if (!submitted || !tokens.verify(secret, submitted)) {
      return res.status(403).json({ message: "Invalid CSRF token" });
    }
  }

  // expose token for clients to send back via X-CSRF-Token header
  res.cookie("XSRF-TOKEN", token, {
    sameSite: "lax",
    secure: isProd,
  });

  next();
});

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
