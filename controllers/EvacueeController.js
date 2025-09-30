const Evacuee = require("../models/EvacueeModel");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// evacuee signup
exports.signupEvacuee = async (req, res) => {
  try {
    // validations
    if (!req.file) {
      return res.status(400).json({ error: "A valid ID picture is required" });
    }
    if (!req.body.first_name || !req.body.last_name || !req.body.email_address || !req.body.password || !req.body.street_number ||
      !req.body.barangay || !req.body.city || !req.body.province || !req.body.sex || !req.body.medical_needs
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existingEvacuee = await Evacuee.findOne({ email_address: req.body.email_address });
    if (existingEvacuee) {
      return res.status(400).json({ error: "The email already exists. Use a different email" });
    }
    // proceed
    const uploadPath = path.join("uploads", Date.now() + "-" + req.file.originalname);
    fs.writeFileSync(uploadPath, req.file.buffer);
    
    const evacuee = await Evacuee.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10),
      id_picture: uploadPath.replace(/\\/g, "/") 
    });

    res.status(201).json({ message: "Evacuee created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// evacuee login
exports.loginEvacuee = async (req, res) => {
  try {
    const evacuee = await Evacuee.findOne({ email_address: req.body.email_address });
    if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });

    const isMatch = await bcrypt.compare(req.body.password, evacuee.password);
    if (!isMatch) return res.status(401).json({ message: "Password or email is incorrect" });
    
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all evacuees
exports.getEvacuees = async (req, res) => {
  try {
    const evacuees = await Evacuee.find();
    res.json(evacuees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get evacuee by id
exports.getEvacueeById = async (req, res) => {
  try {
    const evacuee = await Evacuee.findById(req.params.id);
    if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });
    res.json(evacuee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update evacuee profile
exports.updateEvacuee = async (req, res) => {
  try {
    if (req.body.password) {
      delete req.body.password;
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
    // validations
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Fill all the required fields" });
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

    // proceed
    const salt = await bcrypt.genSalt(10);
    evacuee.password = await bcrypt.hash(newPassword, salt);
    await evacuee.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete evacuee
exports.deleteEvacueeById = async (req, res) => {
  try {
    const evacuee = await Evacuee.findByIdAndDelete(req.params.id);
    if (!evacuee) return res.status(404).json({ error: "Evacuee not found" });
    res.json({ message: "Evacuee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
