const bcrypt = require("bcryptjs");
const Evacuee = require("../models/EvacueeModel");
// const Admin = require("../models/AdminModel"); 
// const EvacuationCenter = require("../models/EvacuationCenterModel"); 
const UserOTP = require("../models/UserOTPModel");

exports.verifyOTP = async (req, res) => {
  try {
    const { email_address, code, role, purpose, newPassword } = req.body;

    if (!email_address || !code || !role || !purpose) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let userModel;
    if (role === "Evacuee") userModel = Evacuee;
    // else if (role === "Admin") userModel = Admin;
    // else if (role === "EvacuationCenter") userModel = EvacuationCenter;
    else return res.status(400).json({ error: "Invalid role" });

    const user = await userModel.findOne({ email_address });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otpRecord = await UserOTP.findOne({ user_id: user._id, role, code });
    if (!otpRecord) return res.status(400).json({ error: "Invalid OTP" });

    if (otpRecord.expiresAt < new Date()) {
      await UserOTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (purpose === "verify") {
      user.isVerified = true;
      await user.save();
      await UserOTP.deleteMany({ user_id: user._id, role });
      return res.json({ message: "Your Gmail account has been verified successfully" });
    }

    if (purpose === "reset") {
      if (!newPassword)
        return res.status(400).json({ error: "New password is required for reset" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      await UserOTP.deleteMany({ user_id: user._id, role });
      return res.json({ message: "Password has been reset successfully" });
    }

    res.status(400).json({ error: "Invalid purpose" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};
