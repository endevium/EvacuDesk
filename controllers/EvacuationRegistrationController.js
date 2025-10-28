const mongoose = require("mongoose");
const EvacuationRegistration = require("../models/EvacuationRegistrationModel");
const EvacuationCenterOccupant = require("../models/EvacuationCenterOccupantsModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");
const Evacuee = require("../models/EvacueeModel");
const CenterArea = require("../models/CenterAreaModel"); 
const { createNotification } = require("./NotificationController");
const asyncHandler = require("../utils/asyncHandler");

// create new registration
exports.registerEvacuee = asyncHandler(async (req, res) => {
  const { evacuee_id, evacuation_center_id, number_of_family_members } = req.body;

  if (!evacuee_id || !evacuation_center_id || !number_of_family_members) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const evacuee = await Evacuee.findById(evacuee_id);
  if (!evacuee) {
    res.status(404);
    throw new Error("Evacuee not found");
  }

  const center = await EvacuationCenter.findById(evacuation_center_id);
  if (!center) {
    res.status(404);
    throw new Error("Evacuation center not found");
  }

  const activeOccupantToACenter = await EvacuationCenterOccupant.findOne({
    evacuee_id,
    status: "Active",
  });
  if (activeOccupantToACenter) {
    res.status(400);
    throw new Error("You already have an active registration in another evacuation center.");
  }

  const existingPendingInThisCenter = await EvacuationRegistration.findOne({
    evacuee_id,
    evacuation_center_id,
    status: "Pending",
    isActive: true,
  });
  if (existingPendingInThisCenter) {
    res.status(400);
    throw new Error("You already have a pending registration in this evacuation center");
  }

  await EvacuationRegistration.create({
    evacuee_id,
    evacuation_center_id,
    number_of_family_members,
    status: "Pending",
  });

  try {
    await createNotification({
      title: "New evacuation registration",
      body: `An evacuee ${evacuee.first_name} ${evacuee.last_name} applied for ${center.name}`,
      recipient_id: evacuation_center_id,
      recipient_role: "EvacuationCenter",
      meta: { type: "registration", evacuee_id, evacuation_center_id },
    });
  } catch (err) {
    console.error("Failed to create notification for center:", err.message || err);
  }

  res.status(201).json({ message: "Registration submitted successfully" });
});

// get all registrations
exports.getRegistrations = asyncHandler(async (req, res) => {
  const registrations = await EvacuationRegistration.find()
    .populate("evacuee_id", "first_name last_name")
    .populate("evacuation_center_id", "name address");
  res.status(200).json(registrations);
});

// get pending registrations by evacuee ID
exports.getPendingRegistrationsByEvacueeId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Evacuee ID");
  }

  const registrations = await EvacuationRegistration.find({
    evacuee_id: id,
    status: "Pending",
  });

  if (registrations.length === 0) {
    return res.status(204).json({ message: "No pending registrations found" });
  }

  res.status(200).json(registrations);
});

// get approved registrations by evacuee ID
exports.getApprovedRegistrationsByEvacueeId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Evacuee ID");
  }

  const registrations = await EvacuationRegistration.find({
    evacuee_id: id,
    status: { $in: ["Approved", "approved"] },
  });

  if (registrations.length === 0) {
    res.status(404);
    throw new Error("No approved registrations found");
  }

  res.status(200).json(registrations);
});

// get registrations by evacuation center ID
exports.getRegistrationByCenterId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Evacuation Center ID");
  }

  const registrations = await EvacuationRegistration.find({ evacuation_center_id: id })
    .populate("evacuee_id", "first_name last_name sex birthdate phone_number street_number barangay city province disabilities")
    .populate("evacuation_center_id", "name address");

  res.status(200).json(registrations);
});

// get not approved registrations by center
exports.getNotApprovedRegistrationByCenterId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid Evacuation Center ID");
  }

  const registrations = await EvacuationRegistration.find({
    evacuation_center_id: id,
    status: { $ne: "Approved" },
  })
    .populate("evacuee_id", "first_name last_name sex birthdate phone_number street_number barangay city province disabilities")
    .populate("evacuation_center_id", "name address");

  res.status(200).json(registrations);
});

// get registration by ID
exports.getRegistrationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const registration = await EvacuationRegistration.findById(id)
    .populate("evacuee_id", "first_name last_name")
    .populate("evacuation_center_id", "name address");

  if (!registration) {
    res.status(404);
    throw new Error("Registration not found");
  }

  res.status(200).json(registration);
});

// update registration status
exports.updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid registration ID");
  }

  const registration = await EvacuationRegistration.findById(id);
  if (!registration) {
    res.status(404);
    throw new Error("Registration not found");
  }

  if (["Approved", "Rejected"].includes(registration.status)) {
    res.status(400);
    throw new Error(`Cannot update registration. It has already been ${registration.status}.`);
  }

  registration.status = status;
  await registration.save();

  if (status === "Approved") {
    let occupantExists = await EvacuationCenterOccupant.findOne({
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
    } else {
      if (occupantExists.status === "Left") {
        occupantExists.status = "Active";
        occupantExists.date_joined = new Date();
        occupantExists.date_left = null;
        occupantExists.number_of_family_members = registration.number_of_family_members;
        occupantExists.assigned_area = null;

        await occupantExists.save();

        await EvacuationCenter.findByIdAndUpdate(
          registration.evacuation_center_id,
          { $inc: { taken_slots: registration.number_of_family_members } }
        );

        await CenterArea.updateMany(
          { "occupants.evacuee_id": occupantExists.evacuee_id },
          { $pull: { occupants: { evacuee_id: occupantExists.evacuee_id } } }
        );
      } else if (occupantExists.status === "Active") {
        const familyCountDifference = registration.number_of_family_members - occupantExists.number_of_family_members;
        if (familyCountDifference !== 0) {
          occupantExists.number_of_family_members = registration.number_of_family_members;
          await occupantExists.save();

          await EvacuationCenter.findByIdAndUpdate(
            registration.evacuation_center_id,
            { $inc: { taken_slots: familyCountDifference } }
          );
        }
      }
    }
  }

  try {
    await createNotification({
      title: `Registration ${status}`,
      body: `Your registration has been ${status.toLowerCase()}`,
      recipient_id: registration.evacuee_id,
      recipient_role: "Evacuee",
      meta: { registration_id: registration._id, status },
    });
  } catch (err) {
    console.error("Failed to notify evacuee:", err.message || err);
  }

  res.status(200).json({ message: `Registration status updated to ${status} successfully` });
});
