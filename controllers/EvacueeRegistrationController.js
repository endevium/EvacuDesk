const mongoose = require("mongoose");
const EvacueeRegistration = require("../models/EvacueeRegistrationModel");

// Create new registration
exports.registerEvacuee = async (req, res) => {
  try {
    const { evacuee_id, evacuation_center_id, number_of_family_members, family_members } = req.body;
    // validations
    if (!evacuee_id || !evacuation_center_id) {
      return res.status(400).json({ error: "User ID and Evacuation Center ID are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(evacuee_id) || !mongoose.Types.ObjectId.isValid(evacuation_center_id)) {
      return res.status(400).json({ error: "Invalid User ID or Evacuation Center ID" });
    }
    // proceed
    const registration = await EvacueeRegistration.create({ evacuee_id, evacuation_center_id, number_of_family_members, family_members });
    res.status(201).json({ message: "Evacuee registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all registrations
exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await EvacueeRegistration.find()
      .populate("evacuee_id", "first_name last_name")
      .populate("evacuation_center_id", "name address");
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// kelangan paba to
// get registration by id
// exports.getRegistrationById = async (req, res) => {
//   try {
//     const { id } = req.params;  

//     const registration = await EvacueeRegistration.findById(id)
//       .populate("evacuee_id", "first_name last_name")
//       .populate("evacuation_center_id", "name address");

//     if (!registration) {
//       return res.status(404).json({ error: "Registration not found" });
//     }

//     res.status(200).json(registration);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get registrations by evacuation center ID
exports.getRegistrationByCenterId = async (req, res) => {
  try {
    const { id } = req.params;
    // validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Evacuation Center ID" });
    }
    // proceed
    const registrations = await EvacueeRegistration.find({ evacuation_center_id: id })
      .populate("evacuee_id", "first_name last_name")
      .populate("evacuation_center_id", "name address");
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update registration status
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const registration = await EvacueeRegistration.findByIdAndUpdate(
      id, { status }, { new: true }
    );
    // validations
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Registration ID" });
    }
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }
    // proceed
    res.status(200).json({ message: "Registration status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
