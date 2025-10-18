const EvacuationCenter = require("../models/EvacuationCenterModel");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserTokenModel");

// create evacuation center
exports.createEvacuationCenter = async (req, res) => {
  try {
    const existingCenterName = await EvacuationCenter.findOne({ name: req.body.name });
    if (existingCenterName) {
      return res.status(400).json({ error: "There is already an evacuation center with that name" });
    }

    const existingEmail = await EvacuationCenter.findOne({ email_address: req.body.email_address });
    if (existingEmail) {
      return res.status(400).json({ error: "Email address already registered" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const uploadPath = path.join("uploads", Date.now() + "-" + req.file.originalname);
    fs.writeFileSync(uploadPath, req.file.buffer);

    await EvacuationCenter.create({
      ...req.body,
      image: uploadPath.replace(/\\/g, "/"),
      password: hashedPassword,
      is_verified: false,
    });

    res.status(201).json({ message: "Evacuation center created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// login evacuation center
exports.loginEvacuationCenter = async (req, res) => {
  try {
    const { email_address, password } = req.body;

    const center = await EvacuationCenter.findOne({ email_address });
    if (!center) {
      return res.status(404).json({ error: "Evacuation center not found" });
    }

    const isMatch = await bcrypt.compare(password, center.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: center._id, role: "EvacuationCenter" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    await UserToken.create({
      user_id: center._id,
      role: "EvacuationCenter",
      token,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// get all evacuation centers
exports.getEvacuationCenters = async (req, res) => {
  try {
    const centers = await EvacuationCenter.find();
    centers.forEach(center => delete center.password);

    res.json(centers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get evacuation center by ID
exports.getEvacuationCenterById = async (req, res) => {
  try {
    const center = await EvacuationCenter.findById(req.params.id);
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });
    res.json(center);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update evacuation center details
exports.updateEvacuationCenter = async (req, res) => {
  try {
    if (req.body.password) {
      return res.status(400).json({ error: "Invalid request" });
    }

    if (req.file) {
      const imagePath = path.join("uploads", Date.now() + "-" + req.file.originalname);
      fs.writeFileSync(imagePath, req.file.buffer);
      req.body.image = imagePath.replace(/\\/g, "/");
    }

    const center = await EvacuationCenter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!center) return res.status(404).json({ error: "Evacuation center not found" });
    res.json({ message: "Evacuation center updated successfully", center });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update evacuation center password
exports.updateEvacuationCenterPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const center = await EvacuationCenter.findById(req.params.id);
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });

    const isMatch = await bcrypt.compare(currentPassword, center.password);
    if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

    center.password = await bcrypt.hash(newPassword, 10);
    await center.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete evacuation center
exports.deleteEvacuationCenterById = async (req, res) => {
  try {
    const center = await EvacuationCenter.findByIdAndDelete(req.params.id);
    if (!center) return res.status(404).json({ error: "Evacuation center not found" });

    if (center.image && fs.existsSync(center.image)) {
      fs.unlinkSync(center.image);
    }

    res.json({ message: "Evacuation center deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
