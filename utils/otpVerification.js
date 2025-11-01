const bcrypt = require("bcryptjs");
const Evacuee = require("../models/EvacueeModel");
const Admin = require("../models/AdminModel"); 
const EvacuationCenter = require("../models/EvacuationCenterModel"); 
const UserOTP = require("../models/UserOTPModel");
const asyncHandler = require("../utils/asyncHandler");
const { generateOTP } = require("../utils/otpGeneration");
const { emailSender } = require("../utils/emailSender");
const { isPasswordPwned } = require("../utils/pwnedPasswords") 

// verify otp 
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email_address, code, role } = req.body;

  if (!email_address || !code || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let userModel;
  if (role === "Evacuee") userModel = Evacuee;
  else if (role === "Admin") userModel = Admin;
  else if (role === "EvacuationCenter") userModel = EvacuationCenter;
  else return res.status(400).json({ error: "Invalid role" });

  const user = await userModel.findOne({ email_address });
  if (!user) return res.status(404).json({ error: "User not found" });

  const otpRecord = await UserOTP.findOne({ user_id: user._id, role, code });
  if (!otpRecord) return res.status(400).json({ error: "Your OTP code is invalid" });

  if (otpRecord.expiresAt < new Date()) {
    await UserOTP.deleteOne({ _id: otpRecord._id });
    return res.status(400).json({ error: "OTP has expired. Please request a new one." });
  }

  otpRecord.isVerified = true; 
  await otpRecord.save();

  res.json({ message: "Your OTP has been verified" });
});

// request otp code for forgot password
exports.requestOtpForForgotPassword = asyncHandler(async (req, res) => {
  const { email_address, role } = req.body;

  if (!email_address || !role) {
    return res.status(400).json({ error: "Email and role are required" });
  }

  let userModel;
  if (role === "Evacuee") userModel = Evacuee;
  else if (role === "Admin") userModel = Admin;
  else if (role === "EvacuationCenter") userModel = EvacuationCenter;
  else return res.status(400).json({ error: "Invalid role" });

  const user = await userModel.findOne({ email_address });
  if (!user) return res.status(404).json({ error: `${role} not found` });

  const otp = await generateOTP(user._id, role);

  await emailSender(user.email_address, user.first_name, otp, "reset");

  res.json({ message: "An OTP code has been sent to your email" });
});

// updating password by verified otp
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email_address, role, newPassword } = req.body;

  if (!email_address || !role || !newPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let userModel;
  if (role === "Evacuee") userModel = Evacuee;
  else if (role === "Admin") userModel = Admin;
  else if (role === "EvacuationCenter") userModel = EvacuationCenter;
  else return res.status(400).json({ error: "Invalid role" });

  const user = await userModel.findOne({ email_address });
  if (!user) return res.status(404).json({ error: "User not found" });

  const otpRecord = await UserOTP.findOne({ user_id: user._id, role, isVerified: true });
  if (!otpRecord) return res.status(400).json({ error: "OTP not verified or expired" });

  // common password check
  if (await isPasswordPwned(newPassword)) {
    return res.status(400).json({ error: "This password has appeared in a data breach. Please choose a stronger password." });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Delete OTPs after successful password reset
  await UserOTP.deleteMany({ user_id: user._id, role });

  res.json({ message: "Password has been reset successfully" });
});
