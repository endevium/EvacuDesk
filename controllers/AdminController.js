const Admin = require("../models/AdminModel");
const bcrypt = require("bcrypt");

// admin login
exports.loginAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Password or username is incorrect" });
    
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // update admin profile
// exports.updateAdmin = async (req, res) => {
//   try {
//     // prevent password update 
//     if (req.body.password) {
//       delete req.body.password;
//       return res.status(400).json({ error: "Invalid request" });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.json({ message: "User updated successfully" });
//   } catch (err) {
//     if (err.name === "ValidationError") {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     res.status(400).json({ error: err.message });
//   }
// };  

// update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // validations
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Fill all the required fields" });
    }
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "You are already using this password. Use a different password" });
    }
    // update password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

