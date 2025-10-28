const EvacuationCenter = require("../models/EvacuationCenterModel");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserTokenModel");
// const { createNotification } = require('./NotificationController');
const { capitalizeFirstLetter } = require("../utils/capitalize");
const asyncHandler = require("../utils/asyncHandler");

// create evacuation center
exports.createEvacuationCenter = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

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
    name: capitalizeFirstLetter(req.body.name),
    region: capitalizeFirstLetter(req.body.region),
    province: capitalizeFirstLetter(req.body.province),
    city: capitalizeFirstLetter(req.body.city),
    barangay: capitalizeFirstLetter(req.body.barangay),
    street: capitalizeFirstLetter(req.body.street),
    evacuation_center_name: capitalizeFirstLetter(req.body.evacuation_center_name),
    image: uploadPath.replace(/\\/g, "/"),
    password: hashedPassword,
    is_verified: true,
  });
  
  res.status(201).json({ message: "Evacuation center created successfully" });
});

// login evacuation center
exports.loginEvacuationCenter = asyncHandler(async (req, res) => {
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

  res.status(200).json({ message: "Login successful", token, id: center._id });
});

// get all evacuation centers
exports.getEvacuationCenters = asyncHandler(async (req, res) => {
  const centers = await EvacuationCenter.find();
  centers.forEach(center => delete center.password);

  res.json(centers);
});

// get evacuation center by ID
exports.getEvacuationCenterById = asyncHandler(async (req, res) => {
  const center = await EvacuationCenter.findById(req.params.id);
  if (!center) return res.status(404).json({ error: "Evacuation center not found" });
  res.json(center);
});

// update evacuation center details
exports.updateEvacuationCenter = asyncHandler(async (req, res) => {
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
});

// update evacuation center password
exports.updateEvacuationCenterPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const center = await EvacuationCenter.findById(req.params.id);
  if (!center) return res.status(404).json({ error: "Evacuation center not found" });

  const isMatch = await bcrypt.compare(currentPassword, center.password);
  if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

  center.password = await bcrypt.hash(newPassword, 10);
  await center.save();

  res.json({ message: "Password updated successfully" });
});

// delete evacuation center
exports.deleteEvacuationCenterById = asyncHandler(async (req, res) => {
  const center = await EvacuationCenter.findById(req.params.id);
  if (!center) return res.status(404).json({ error: "Evacuation center not found" });

  const imagePath = center.image;

  await center.deleteOne();

  if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
  }

  res.json({ message: "Evacuation center deleted successfully" });
});