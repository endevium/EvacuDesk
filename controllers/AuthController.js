const transporter = require("../utils/mailer");
const otpEmail = require("../utils/otpEmail");
const UserOTP = require("../models/UserOTPModel");
const Evacuee = require("../models/EvacueeModel");
const Admin = require("../models/AdminModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");

exports.sendOTP = async (req, res) => {
  const { email_address, role } = req.body;

  if (!email_address || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let user = null;
    if (role === "Evacuee") {
      user = await Evacuee.findOne({ email_address });
    } else if (role === "Admin") {
      user = await Admin.findOne({ email_address });
    } else if (role === "EvacuationCenter") {
      user = await EvacuationCenter.findOne({ email_address });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await UserOTP.deleteMany({ user_id: user._id, role });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await UserOTP.create({
      user_id: user._id,
      role,
      code: otp,
      expiresAt,
    });

    // send otp
    await transporter.sendMail({
      from: `EvacuDesk <${process.env.SMTP_USER}>`,
      to: email_address,
      subject: "Verification Code – Do Not Share",
      html: otpEmail(otp),
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email_address, role, otp } = req.body;

  if (!email_address || !role || !otp) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let user = null;

    if (role === "Evacuee") {
      user = await Evacuee.findOne({ email_address });
    } else if (role === "Admin") {
      user = await Admin.findOne({ email_address });
    } else if (role === "EvacuationCenter") {
      user = await EvacuationCenter.findOne({ email_address });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const record = await UserOTP.findOne({ user_id: user._id, role }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ error: "No OTP found for this user" });
    }

    if (record.used) {
      return res.status(400).json({ error: "OTP already used" });
    }

    if (Date.now() > new Date(record.expiresAt).getTime()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.code !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    record.used = true;
    await record.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};
