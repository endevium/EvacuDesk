const express = require("express");
const router = express.Router();
const otpController = require("../utils/otpVerification.js");

router.post("/verify", otpController.verifyOTP);
router.post("/request-otp", otpController.requestOtpForForgotPassword);
router.post("/reset-password", otpController.resetPassword);

module.exports = router;
