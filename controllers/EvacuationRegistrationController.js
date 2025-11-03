const mongoose = require("mongoose");
const EvacuationRegistration = require("../models/EvacuationRegistrationModel");
const EvacuationCenterOccupant = require("../models/EvacuationCenterOccupantsModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");
const Evacuee = require("../models/EvacueeModel");
const CenterArea = require("../models/CenterAreaModel"); 
const { createNotification } = require("./NotificationController");
const asyncHandler = require("../utils/asyncHandler");

function priorityAlgorithm({
  pwd = 0,
  pregnant = 0,
  infants = 0,
  seniors = 0,
  childrens = 0,
  adults = 0,
  teens = 0
}) {
  // base scoring per category
  let baseScore =
    (pwd * 3) +
    (infants * 4) +
    (pregnant * 3) +
    (seniors * 2.5) +
    (childrens * 2) +
    (teens * 1) +
    (adults * 1);

  // total members
  const totalMembers = pwd + pregnant + infants + seniors + childrens + adults + teens;

  let priorityScore = baseScore;

  // family size adjustment
  if (totalMembers > 5) {
    priorityScore *= 1 + ((totalMembers - 5) * 0.05);
  } else if (totalMembers < 3) {
    priorityScore *= 1.1;
  }

  // No adults 
  if (adults === 0 && totalMembers > 0) {
    priorityScore *= 1.5; 
  }

  // final priority level (1–5)
  if (priorityScore <= 2) return 1;
  if (priorityScore <= 5) return 2;
  if (priorityScore <= 8) return 3;
  if (priorityScore <= 12) return 4;
  return 5;
}

// create new registration
exports.registerEvacuee = asyncHandler(async (req, res) => {
  const {
    evacuee_id,
    evacuation_center_id,
    pwd = 0,
    seniors = 0,
    pregnant = 0,
    infants = 0,
    childrens = 0,
    teens = 0,
    adults = 0,
    for_pickup
  } = req.body;

  if (!evacuee_id || !evacuation_center_id) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  // evacuee exist
  const evacuee = await Evacuee.findById(evacuee_id);
  if (!evacuee) {
    res.status(404);
    throw new Error("Evacuee not found");
  }

  // evac center exist
  const center = await EvacuationCenter.findById(evacuation_center_id);
  if (!center) {
    res.status(404);
    throw new Error("Evacuation center not found");
  }

  // active occupant
  const activeOccupantToACenter = await EvacuationCenterOccupant.findOne({
    evacuee_id,
    status: "Active",
  });
  if (activeOccupantToACenter) {
    res.status(400);
    throw new Error("You already have an active registration in an evacuation center.");
  }

  // existing pending reg
  const existingPendingRegistration = await EvacuationRegistration.findOne({
    evacuee_id,
    status: "Pending",
    isActive: true,
  });
  if (existingPendingRegistration) {
    res.status(400);
    throw new Error("You already have a pending registration in an evacuation center");
  }

  // total fam mem 
  const number_of_family_members = pwd + seniors + pregnant + infants + childrens + teens + adults;

  // taken slots and family number in registration comparison
  const totalRegisteredMembers = await EvacuationRegistration.aggregate([
    { $match: { evacuation_center_id: center._id, status: { $in: ["Pending", "Active"] } } },
    { $group: { _id: null, total: { $sum: "$number_of_family_members" } } }
  ]);

  const currentMembers = totalRegisteredMembers[0]?.total || 0;

  if (currentMembers + number_of_family_members > center.capacity) {
    res.status(400);
    throw new Error(`Cannot register. This center has reached its capacity.`);
  }

  const priority_level = priorityAlgorithm({ pwd, pregnant, infants, seniors, childrens, teens, adults });

  await EvacuationRegistration.create({
    evacuee_id,
    evacuation_center_id,
    number_of_family_members,
    pwd,
    seniors,
    pregnant,
    childrens,
    teens,
    adults,
    priority_level,
    status: "Pending",
    for_pickup
  });

  // notify evac center staff
  await createNotification({
    title: "New evacuation registration",
    body: `An evacuee ${evacuee.first_name} ${evacuee.last_name} with a total of ${number_of_family_members} has applied to your center.`,
    recipient_id: evacuation_center_id,
    recipient_role: "EvacuationCenter",
    meta: { type: "registration", evacuee_id, evacuation_center_id },
  });

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
    .populate("evacuee_id", "first_name last_name sex birthdate phone_number street_number barangay city province disabilities id_picture")
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
    .populate("evacuee_id", "first_name last_name sex birthdate phone_number street_number barangay city province disabilities id_picture")
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

  // registration exist
  const registration = await EvacuationRegistration.findById(id);
  if (!registration) {
    res.status(404);
    throw new Error("Registration not found");
  }

  // registration processed already
  if (["Approved", "Rejected"].includes(registration.status)) {
    res.status(400);
    throw new Error(`Cannot update registration. It has already been ${registration.status}.`);
  }

  // capacity check before approving
  if (status === "Approved") {
    const center = await EvacuationCenter.findById(registration.evacuation_center_id);
    if (!center) {
      res.status(404);
      throw new Error("Evacuation center not found.");
    }

    const availableSlots = center.capacity - center.taken_slots;
    const familyCount = registration.number_of_family_members;

    if (familyCount > availableSlots) {
      res.status(400);
      throw new Error(
        `Cannot approve registration. Only ${availableSlots} slot(s) left in this evacuation center.`
      );
    }
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
        pwd: registration.pwd,
        pregnant: registration.pregnant,
        infants: registration.infants,
        childrens: registration.childrens,
        teens: registration.teens,
        adults: registration.adults,
        seniors: registration.seniors,
        priority_level: registration.priority_level,
        date_joined: new Date(),
        status: "Active",
      });

      await EvacuationCenter.findByIdAndUpdate(
        registration.evacuation_center_id,
        { $inc: { taken_slots: registration.number_of_family_members } }
      );
    } else {
      if (occupantExists.status === "Returned") {
        occupantExists.status = "Active";
        occupantExists.date_joined = new Date();
        occupantExists.date_returned = null;
        occupantExists.number_of_family_members = registration.number_of_family_members;
        occupantExists.pwd = registration.pwd;
        occupantExists.infants = registration.infants;
        occupantExists.childrens = registration.childrens;
        occupantExists.teens = registration.teens;
        occupantExists.adults = registration.adults;
        occupantExists.seniors = registration.seniors;
        occupantExists.pregnant = registration.pregnant;
        occupantExists.priority_level = registration.priority_level;
        occupantExists.assigned_area = null;

        await occupantExists.save();

        // reuse existing record 
        await EvacuationCenter.findByIdAndUpdate(
          registration.evacuation_center_id,
          { $inc: { taken_slots: registration.number_of_family_members } }
        );

        await CenterArea.updateMany(
          { "occupants.evacuee_id": occupantExists.evacuee_id },
          { $pull: { occupants: { evacuee_id: occupantExists.evacuee_id } } }
        );
      } else if (occupantExists.status === "Active") {
        // udpate fam count if changed 
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

  await createNotification({
    title: `Registration ${status}`,
    body: `Your registration has been ${status.toLowerCase()}`,
    recipient_id: registration.evacuee_id,
    recipient_role: "Evacuee",
    meta: { registration_id: registration._id, status },
  });

  res.status(200).json({ message: `Your registration has been ${status.toLowerCase()}` });
});

exports.updatePickupStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pickup_status } = req.body;

  const registration = await EvacuationRegistration.findById(id);
  if (!registration) {
    return res.status(404).json({ message: "Evacuation registration not found" });
  }

  registration.pickup_status = pickup_status;
  await registration.save();

  res.status(200).json({ message: "Pickup status updated successfully" });
});


exports.deletePendingRegistrationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  console.log(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid registration ID." });
  }

  const registration = await EvacuationRegistration.findById(id);

  if (!registration) {
    return res.status(404).json({ message: "Registration not found." });
  }

  if (registration.status !== "Pending") {
    return res.status(400).json({ message: "Only pending registrations can be deleted." });
  }

  await EvacuationRegistration.findByIdAndDelete(id);

  res.status(200).json({ message: "Pending registration deleted successfully." });
});