const express = require("express");
const router = express.Router();
const otpController = require("../utils/otpVerification.js");

router.post("/verify", otpController.verifyOTP);

module.exports = router;
