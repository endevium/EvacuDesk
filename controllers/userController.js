const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// create user
exports.createUser = async (req, res) => {
  try {
    const user = await User.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 10) 
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: "The email already exists. Use a different email." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Missing required fields" });
    }
    res.status(400).json({ error: err.message });
  }
};

// get all user
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Missing required fields" });
    }
    res.status(400).json({ error: err.message });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
