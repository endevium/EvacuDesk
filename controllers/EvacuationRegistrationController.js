const mongoose = require("mongoose");
const EvacuationRegistration = require("../models/EvacuationRegistrationModel");
const EvacuationCenterOccupant = require("../models/EvacuationCenterOccupantsModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");
const Evacuee = require("../models/EvacueeModel");
const { createNotification } = require('./NotificationController');

// create new registration
exports.registerEvacuee = async (req, res) => {
  try {
    const { evacuee_id, evacuation_center_id, number_of_family_members } = req.body;

    if (!evacuee_id || !evacuation_center_id || !number_of_family_members) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const evacuee = await Evacuee.findById(evacuee_id);
    if (!evacuee) {
      return res.status(404).json({ error: "Evacuee not found" });
    }

    const center = await EvacuationCenter.findById(evacuation_center_id);
    if (!center) {
      return res.status(404).json({ error: "Evacuation center not found" });
    }

    const existing = await EvacuationRegistration.findOne({
      evacuee_id,
      evacuation_center_id,
      status: { $in: ["Pending", "Approved"] }
    });

    if (existing) {
      return res.status(400).json({ error: "You already have a pending registration in this evacuation center" });
    }

    await EvacuationRegistration.create({
      evacuee_id,
      evacuation_center_id,
      number_of_family_members,
      status: "Pending"
    });

    // create evacuation registration notification to evacuation center
    try {
      await createNotification({
        title: 'New evacuation registration',
        body: `${evacuee.first_name} ${evacuee.last_name} applied for ${center.name}`,
        recipient_id: evacuation_center_id,
        recipient_role: 'EvacuationCenter',
        meta: { type: 'registration', evacuee_id, evacuation_center_id }
      });
    } catch (err) {
      console.error('Failed to create notification for center:', err.message || err);
    }

    res.status(201).json({ message: "Registration submitted successfully" });
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

// get pending registrations of evacuee id
exports.getPendingRegistrationsByEvacueeId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Evacuee ID" });
    }

    const registrations = await EvacuationRegistration.find({
      evacuee_id: id,
      status: "Pending",
    });

    if (registrations.length === 0) {
      return res.status(404).json({ message: "No pending registrations found" });
    }

    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get approved registrations of evacuee id
exports.getApprovedRegistrationsByEvacueeId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Evacuee ID" });
    }

    const registrations = await EvacuationRegistration.find({
      evacuee_id: id,
      status: { $in: ["Approved", "approved"] },
    });

    if (registrations.length === 0) {
      return res.status(404).json({ message: "No approved registrations found" });
    }

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
      .populate("evacuee_id", "first_name last_name sex birthdate phone_number street_number barangay city province disabilities")
      .populate("evacuation_center_id", "name address");

    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotApprovedRegistrationByCenterId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Evacuation Center ID" });
    }

    const registrations = await EvacuationRegistration.find({
      evacuation_center_id: id,
      status: { $ne: "Approved" }
    })
      .populate(
        "evacuee_id",
        "first_name last_name sex birthdate phone_number street_number barangay city province disabilities"
      )
      .populate("evacuation_center_id", "name address");

    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get registration by id 
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
      return res.status(400).json({ error: "Invalid registration ID" });
    }

    const registration = await EvacuationRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (["Approved", "Rejected"].includes(registration.status)) {
      return res.status(400).json({
        error: `Cannot update registration. It has already been ${registration.status}.`,
      });
    }

    registration.status = status;
    await registration.save();

    if (status === "Approved") {
      const occupantExists = await EvacuationCenterOccupant.findOne({
        evacuee_id: registration.evacuee_id,
        evacuation_center_id: registration.evacuation_center_id,
      });

      if (!occupantExists) {
        await EvacuationCenterOccupant.create({
          evacuee_id: registration.evacuee_id,
          evacuation_center_id: registration.evacuation_center_id,
          number_of_family_members: registration.number_of_family_members,
          date_joined: new Date(),
          status: "Active",
        });

        await EvacuationCenter.findByIdAndUpdate(
          registration.evacuation_center_id,
          { $inc: { taken_slots: registration.number_of_family_members } } 
        );
      }
    }

    // update registration status notification to evacuee
    try {
      await createNotification({
        title: `Registration ${status}`,
        body: `Your registration has been ${status.toLowerCase()}`,
        recipient_id: registration.evacuee_id,
        recipient_role: 'Evacuee',
        meta: { registration_id: registration._id, status }
      });
    } catch (err) {
      console.error('Failed to notify evacuee:', err.message || err);
    }

    res.status(200).json({ message: `Registration status updated to ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};