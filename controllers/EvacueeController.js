const Evacuee = require("../models/EvacueeModel");
const UserToken = require("../models/UserTokenModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const EvacuationCenter = require("../models/EvacuationCenterModel");
const path = require("path");
const { generateOTP } = require("../utils/otpGeneration");
const { emailSender } = require("../utils/emailSender");
const asyncHandler = require("../utils/asyncHandler");
const { isPasswordPwned } = require("../utils/pwnedPasswords")

// center recommendation
exports.getCenterRecommendation = asyncHandler(async (req, res) => {
  const evacuee = await Evacuee.findById(req.params.id);
  if (!evacuee) {
    return res.status(404).json({ error: "Evacuee not found" });
  }

  const center = await EvacuationCenter.find({ barangay: evacuee.barangay }).select("-password -email_address -__v -is_verified -role -createdAt -updatedAt");
  if (!center) {
    return res.status(404).json({ error: "No evacuation center found in your barangay" });
  }

  res.json(center);
});

// email exists
exports.getExistingEmail = asyncHandler(async (req, res) =>{
  const { email_address } = req.body;

  const [existingEvacuee, existingCenter] = await Promise.all([
    Evacuee.findOne({ email_address }),
    EvacuationCenter.findOne({ email_address })
  ]);
  if (existingEvacuee || existingCenter) {
    return res.status(400).json({ error: "The email already exists. Use a different email." });
  } 

  return res.status(200).json({ message: "Email is available." });
})

// evacuee signup
exports.signupEvacuee = asyncHandler(async (req, res) => {
  if (!req.files || !req.files['id_picture']) {
    return res.status(400).json({ error: "ID picture is required" });
  }

  const idFile = req.files['id_picture'][0];
  const profileFile = req.files['profile_picture'] ? req.files['profile_picture'][0] : null;

  const { email_address, password, first_name, last_name } = req.body;

  // const nameRegex = /^[a-zA-Z\s]{2,15}$/;
  // if (!first_name || !nameRegex.test(first_name.trim())) {
  //   return res.status(400).json({ error: "First name too short or contains special characters" });
  // }
  // if (!last_name || !nameRegex.test(last_name.trim())) {
  //   return res.status(400).json({ error: "Last name too short or contains special characters" });
  // }

  // email exists
  const [existingEvacuee, existingCenter] = await Promise.all([
    Evacuee.findOne({ email_address }),
    EvacuationCenter.findOne({ email_address })
  ]);

  if (existingEvacuee || existingCenter) {
    return res.status(400).json({ error: "The email already exists. Use a different email." });
  }

  // id aand profile picture
  const idUploadPath = path.join("uploads", Date.now() + "-id-" + idFile.originalname);
  fs.writeFileSync(idUploadPath, idFile.buffer);
  let profileUploadPath = null;
  if (profileFile) {
    profileUploadPath = path.join("uploads", Date.now() + "-profile-" + profileFile.originalname);
    fs.writeFileSync(profileUploadPath, profileFile.buffer);
  }

  // common password check
  if (await isPasswordPwned(password)) {
    return res.status(400).json({ error: "This password has appeared in a data breach. Please choose a stronger password." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const evacuee = await Evacuee.create({
    ...req.body,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email_address: email_address.toLowerCase(),
    password: hashedPassword,
    id_picture: idUploadPath.replace(/\\/g, "/"),
    profile_picture: profileUploadPath ? profileUploadPath.replace(/\\/g, "/") : null,
    is_verified: false
  });

  const otp = await generateOTP(evacuee._id, "Evacuee");
  await emailSender(evacuee.email_address, evacuee.first_name, otp, "verify");

  res.status(201).json({
    message: "Please verify your email address. We have sent an OTP to your email",
  });
});

// evacuee login
exports.loginEvacuee = asyncHandler(async (req, res) => {
  const { email_address, password } = req.body;
  const evacuee = await Evacuee.findOne({ email_address });

  if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });
  
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

  res.json({ message: "Login successful", token, id: evacuee._id, role: "Evacuee" });
});

// get all evacuees
exports.getEvacuees = asyncHandler(async (req, res) => {
  const evacuees = await Evacuee.find().select("-password");
  res.json(evacuees);
});

// get evacuee by id
exports.getEvacueeById = asyncHandler(async (req, res) => {
  const evacuee = await Evacuee.findById(req.params.id)
    .select("-password");

  if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });
    delete evacuee.password;

  res.json(evacuee);
});

// update evacuee profile
exports.updateEvacuee = asyncHandler(async (req, res) => {
  if (req.body.password || req.body.role) {
    delete req.body.password;
    delete req.body.role;
    return res.status(400).json({ error: "Invalid request" });
  }

  if (req.file) {
    const profileFile = req.file;

    // file size
    const maxFileSize = 10 * 1024 * 1024;
    if (profileFile.size > maxFileSize) {
      return res.status(400).json({ error: "File size too large" });
    }

    // save
    const uploadPath = path.join("uploads", Date.now() + "-profile-" + profileFile.originalname);
    fs.writeFileSync(uploadPath, profileFile.buffer);

    req.body.profile_picture = uploadPath.replace(/\\/g, "/");

    // delete old profile picture
    const evacueeOld = await Evacuee.findById(req.params.id);
    if (evacueeOld && evacueeOld.profile_picture) {
      fs.unlink(evacueeOld.profile_picture, (err) => {
        if (err) console.error("Failed to delete old profile picture:", err);
      });
    }
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
});

// update password
exports.updatePassword = asyncHandler(async (req, res) => {
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
});

// delete evacuee
exports.deleteEvacueeById = asyncHandler(async (req, res) => {
  const evacuee = await Evacuee.findById(req.params.id);
  if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });

  await evacuee.deleteOne();

  if (evacuee.id_picture && fs.existsSync(evacuee.id_picture)) {
    fs.unlinkSync(evacuee.id_picture);
  }

  res.json({ message: "Evacuee deleted successfully" });
});

