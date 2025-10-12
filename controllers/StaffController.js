const Staff = require("../models/StaffModel");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// staff signup
exports.signupStaff = async (req, res) => {
  try {

    if (!req.files || !req.files.id_picture || !req.files.authorization_letter) {
      return res.status(400).json({ error: "An ID picture and authorization letter are required for verification process" });
    }

    if (!req.body.first_name || !req.body.last_name || !req.body.email_address || !req.body.password 
        || !req.body.organization || !req.body.position
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingStaff = await Staff.findOne({ email_address: req.body.email_address });
    if (existingStaff) {
      return res.status(400).json({ error: "The email already exists. Use a different email" });
    }
    
    const idPicturePath = path.join("uploads", Date.now() + "-" + req.files.id_picture[0].originalname);
    fs.writeFileSync(idPicturePath, req.files.id_picture[0].buffer);

    const authLetterPath = path.join("uploads", Date.now() + "-" + req.files.authorization_letter[0].originalname);
    fs.writeFileSync(authLetterPath, req.files.authorization_letter[0].buffer);

    await Staff.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10),
      id_picture: idPicturePath.replace(/\\/g, "/"),
      authorization_letter: authLetterPath.replace(/\\/g, "/")
    });

    res.status(201).json({ message: "Staff created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// staff login
exports.loginStaff = async (req, res) => {
  try {
    const staff = await Staff.findOne({ email_address: req.body.email_address });
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const isMatch = await bcrypt.compare(req.body.password, staff.password);
    if (!isMatch) return res.status(401).json({ message: "Password or email is incorrect" });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all staffs
exports.getStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find().select("-password");

    res.json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get user by id
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select("-password");
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update staff  profile
exports.updateStaff = async (req, res) => {
  try {
    if (req.body.password || req.body.status) {
      delete req.body.password;
      delete req.body.status;
      return res.status(400).json({ error: "Invalid request" });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json({ message: "Staff updated successfully" });
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

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "You are already using this password. Use a different password" });
    }

    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(newPassword, salt);

    await staff.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// update status 
exports.updateStaffStatus = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json({ message: "Staff updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete staff
exports.deleteStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    if (staff.image && fs.existsSync(staff.image)) {
      fs.unlinkSync(staff.image);
    }

    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
