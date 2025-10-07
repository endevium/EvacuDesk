const mongoose = require("mongoose");
const EvacuationRegistration = require("../models/EvacuationRegistrationModel");
const EvacuationCenterOccupant = require("../models/EvacuationCenterOccupantsModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");

// create new registration
exports.registerEvacuee = async (req, res) => {
  try {
    const { evacuee_id, evacuation_center_id, family_members } = req.body;

    if (!evacuee_id || !evacuation_center_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(evacuee_id) ||
      !mongoose.Types.ObjectId.isValid(evacuation_center_id)
    ) {
      return res.status(400).json({ error: "Invalid Evacuee ID or Evacuation Center ID" });
    }

    const center = await EvacuationCenter.findById(evacuation_center_id);
    if (!center) {
      return res.status(404).json({ error: "Evacuation center not found" });
    }

    if (center.status !== "approved") {
      return res.status(400).json({ error: `Invalid request` });
    }

    // pag ba may pending registration yung evacuee sa ibang evac center ok lang?
    const existingRegistration = await EvacuationRegistration.findOne({
      evacuee_id,
      evacuation_center_id,
    });
    
    if (existingRegistration) {
      return res.status(400).json({ error: "You are already registered in this evacuation center" });
    }

    const number_of_family_members = Array.isArray(family_members)
      ? family_members.length
      : 0;
    
    await EvacuationRegistration.create({ 
      evacuee_id,
      evacuation_center_id,
      number_of_family_members,
      family_members });

    res.status(201).json({ message: "Evacuee registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all registrations
exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await EvacuationRegistration.find()
      .populate("evacuee_id", "first_name last_name")
      .populate("evacuation_center_id", "name address");

    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get registrations by evacuation center id
exports.getRegistrationByCenterId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Evacuation Center ID" });
    }

    const registrations = await EvacuationRegistration.find({ evacuation_center_id: id })
      .populate("evacuee_id", "first_name last_name")
      .populate("evacuation_center_id", "name address");

    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get registration by id (kelangan paba to?)
exports.getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;  

    const registration = await EvacuationRegistration.findById(id)
      .populate("evacuee_id", "first_name last_name")
      .populate("evacuation_center_id", "name address");

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    res.status(200).json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update registration status
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Registration ID" });
    }

    const registration = await EvacuationRegistration.findById(id);

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (registration.status === "approved" || registration.status === "rejected") {
      return res.status(400).json({
        error: `Cannot update registration. It has already been ${registration.status}.`,
      });
    }

    registration.status = status;
    await registration.save();

    if (status === "approved") {
      const occupant = await EvacuationCenterOccupant.findOne({
        evacuee_id: registration.evacuee_id,
        evacuation_center_id: registration.evacuation_center_id
      });

      if (occupant && occupant.status === "active") {
        return res.status(400).json({ error: "Evacuee is already an active occupant in this evacuation center" });
      }

      if (!occupant) {
        await EvacuationCenterOccupant.create({
          evacuee_id: registration.evacuee_id,
          evacuation_center_id: registration.evacuation_center_id,
          number_of_family_members: registration.number_of_family_members || 0,
          family_members: registration.family_members || [],
          date_joined: new Date(),
          status: "active",
        });

        const familyCount = (registration.family_members?.length || 0) + 1

        await EvacuationCenter.findByIdAndUpdate(
          registration.evacuation_center_id,
          { $inc: { taken_slots: familyCount } }
        );
      }
    }

    res.status(200).json({ message: "Registration status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
