const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

// otp delivery and verification
router.post("/account/send-otp", AuthController.sendOTP);
router.post("/account/verify-otp", AuthController.verifyOTP);

module.exports = router;
