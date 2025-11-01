const EvacuationCenter = require("../models/EvacuationCenterModel");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserTokenModel");
// const { createNotification } = require('./NotificationController');
const Evacuee = require("../models/EvacueeModel");
const { capitalizeWords, capitalizeFirstLetter } = require("../utils/capitalize");
const asyncHandler = require("../utils/asyncHandler");
const { createStockRecord } = require('./StocksController');
const { isPasswordPwned } = require("../utils/pwnedPasswords");

// create evacuation center
exports.createEvacuationCenter = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Evacuation center image is required" });
  }

  const { email_address, password } = req.body;

  // // email
  // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // if (!email_address || !emailRegex.test(email_address)) {
  //   return res.status(400).json({ error: "Please provide a valid email address" });
  // }

  // // password 
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  // if (!password || !passwordRegex.test(password)) {
  //   return res.status(400).json({ 
  //     error: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character" 
  //   });
  // }

  // existing center name
  const existingCenterName = await EvacuationCenter.findOne({
    name: { $regex: new RegExp(`^${req.body.name.trim()}$`, "i") }
  });
  if (existingCenterName) {
    return res.status(400).json({ error: "There is already an evacuation center with that name" });
  }


  // existing email
  const [existingEvacuee, existingCenter] = await Promise.all([
    Evacuee.findOne({ email_address }),
    EvacuationCenter.findOne({ email_address })
  ]);
  if (existingEvacuee || existingCenter) {
    return res.status(400).json({ error: "The email already exists. Use a different email." });
  }

  // // common password
  // if (await isPasswordPwned(password)) {
  //   return res.status(400).json({ error: "This password has appeared in a data breach. Please choose a stronger password."});
  // }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const uploadPath = path.join("uploads", Date.now() + "-" + req.file.originalname);
  fs.writeFileSync(uploadPath, req.file.buffer);

  const center = await EvacuationCenter.create({
    ...req.body,
    name: capitalizeWords(req.body.name),
    region: capitalizeFirstLetter(req.body.region),
    province: capitalizeFirstLetter(req.body.province),
    city: capitalizeFirstLetter(req.body.city),
    barangay: capitalizeFirstLetter(req.body.barangay),
    street: capitalizeFirstLetter(req.body.street),
    image: uploadPath.replace(/\\/g, "/"),
    password: hashedPassword,
    is_verified: true,
  });

  await createStockRecord({
    source: 'EvacuationCenter',
    evacuation_center_id: center._id
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
    { expiresIn: process.env.JWT_EXPIRES_IN }
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
  const centers = await EvacuationCenter.find().select('-password -email_address -__v');
  centers.forEach(center => delete center.password);

  res.json(centers);
});

// get evacuation center by ID
exports.getEvacuationCenterById = asyncHandler(async (req, res) => {
  const center = await EvacuationCenter.findById(req.params.id).select('-password -email_address -__v');
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