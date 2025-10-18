const Evacuee = require("../models/EvacueeModel");
const UserToken = require("../models/UserTokenModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { generateOTP } = require("../utils/otpGeneration");
const { emailSender } = require("../utils/emailSender");

// evacuee signup
exports.signupEvacuee = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "A valid ID picture is required" });

    const existing = await Evacuee.findOne({ email_address: req.body.email_address });
    if (existing) return res.status(400).json({ error: "The email already exists. Use a different one." });

    const uploadPath = path.join("uploads", Date.now() + "-" + req.file.originalname);
    fs.writeFileSync(uploadPath, req.file.buffer);

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const evacuee = await Evacuee.create({
      ...req.body,
      password: hashedPassword,
      id_picture: uploadPath.replace(/\\/g, "/"),
      is_verified: false
    });

    const otp = await generateOTP(evacuee._id, "Evacuee");
    await emailSender(evacuee.email_address, evacuee.first_name, otp, "verify");

    res.status(201).json({ message: "Please verify your email address. We have sent an OTP to your email." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// evacuee login
exports.loginEvacuee = async (req, res) => {
  try {
    const { email_address, password } = req.body;
    const evacuee = await Evacuee.findOne({ email_address });

    if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });

    if (!evacuee.is_verified) {
      return res.status(403).json({ error: "Invalid request" });
    }

    const isMatch = await bcrypt.compare(password, evacuee.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect password or email." });

    const token = jwt.sign(
      { id: evacuee._id, role: "Evacuee" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    await UserToken.create({
      user_id: evacuee._id,
      role: "Evacuee",
      token,
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all evacuees
exports.getEvacuees = async (req, res) => {
  try {
    const evacuees = await Evacuee.find().select("-password");
      
    res.json(evacuees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get evacuee by id
exports.getEvacueeById = async (req, res) => {
  try {
    const evacuee = await Evacuee.findById(req.params.id)
      .select("-password");

    if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });
      delete evacuee.password;

    res.json(evacuee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update evacuee profile
exports.updateEvacuee = async (req, res) => {
  try {
    if (req.body.password || req.body.role) {
      delete req.body.password;
      delete req.body.role;
      return res.status(400).json({ error: "Invalid request" });
    }

    const evacuee = await Evacuee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!evacuee) {
      return res.status(404).json({ error: "Evacuee not found" });
    }

    res.json({ message: "Evacuee updated successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Missing required fields" });
    }
    res.status(400).json({ error: err.message });
  }
};

// update password
exports.updatePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const evacuee = await Evacuee.findById(req.params.id);
    if (!evacuee) {
      return res.status(404).json({ error: "Evacuee not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, evacuee.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "You are already using this password. Use a different password" });
    }

    const salt = await bcrypt.genSalt(10);
    evacuee.password = await bcrypt.hash(newPassword, salt);
    await evacuee.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// reset password
exports.forgotPassword = async (req, res) => {
  try {
    const { email_address } = req.body;
    if (!email_address) return res.status(400).json({ error: "Email is required" });

    const evacuee = await Evacuee.findOne({ email_address });
    if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });

    const otp = await generateOTP(evacuee._id, "Evacuee");
    await emailSender(evacuee.email_address, evacuee.first_name, otp, "reset");

    res.json({ message: "An OTP has been sent to your email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete evacuee
exports.deleteEvacueeById = async (req, res) => {
  try {
    const evacuee = await Evacuee.findByIdAndDelete(req.params.id);
    if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });

    if (evacuee.id_picture && fs.existsSync(evacuee.id_picture)) {
      fs.unlinkSync(evacuee.id_picture);
    }

    res.json({ message: "Evacuee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
