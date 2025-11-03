const mongoose = require("mongoose");
const EvacuationCenter = require('../models/EvacuationCenterModel')
const EvacuationCenterOccupants = require("../models/EvacuationCenterOccupantsModel");
const CenterArea = require("../models/CenterAreaModel");
const EvacuationRegistration = require("../models/EvacuationRegistrationModel");
const asyncHandler = require('../utils/asyncHandler');

// get all occupants
exports.getAllOccupants = asyncHandler(async (req, res) => {
  const occupants = await EvacuationCenterOccupants.find()
    // .populate("evacuation_center_id")
    .populate("evacuee_id")
    .populate("assigned_area", "area_name");
  res.json(occupants);
});

// get occupants by evacuation center id - NO VIRTUALS VERSION
exports.getOccupantsByCenterId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const center = await EvacuationCenter.findById(id);
  if (!center) {
    return res.status(404).json({ error: "Evacuation center not found" });
  }

  const occupants = await EvacuationCenterOccupants.find({
    evacuation_center_id: id
  })
    .populate("evacuee_id", "first_name last_name sex birthdate phone_number street barangay city province disabilities id_picture")
    .populate("assigned_area", "area_name")
    .select("-__v");

  const formatted = occupants.map(occ => ({
    _id: occ._id,
    evacuee: occ.evacuee_id || {},
    number_of_family_members: occ.number_of_family_members,
    status: occ.status,
    date_joined: occ.date_joined,
    date_returned: occ.date_returned,
    assigned_area: occ.assigned_area ? occ.assigned_area.area_name : null
  }));

  res.json({
    evacuation_center_id: id,
    occupants: formatted
  });
});

// get occupant by id
exports.getOccupantById = asyncHandler(async (req, res) => {
  const occupant = await EvacuationCenterOccupants.findById(req.params.id)
  //   .populate("evacuation_center_id", "name address capacity")
  .populate("assigned_area", "area_name")

  if (!occupant) return res.status(404).json({ error: "Occupant not found" });

  res.json(occupant);
});

// get active occupants
exports.getActiveOccupants = asyncHandler(async (req, res) => {
  const activeOccupants = await EvacuationCenterOccupants.find({ status: "Active" })
    .populate("evacuee_id")
    .populate("evacuation_center_id")
    .populate("assigned_area", "area_name")
    .lean();

  if (!activeOccupants || activeOccupants.length === 0) {
    return res.status(204).json({ message: "No active occupants found" });
  }

  const formattedOccupants = activeOccupants.map(({ _id, evacuee_id, evacuation_center_id, status, date_joined, number_of_family_members }) => {
    if (evacuee_id) {
      delete evacuee_id.password;
      delete evacuee_id.createdAt;
      delete evacuee_id.updatedAt;
      delete evacuee_id.__v;
    }

    return {
      _id,
      evacuee: evacuee_id || {},
      evacuation_center: evacuation_center_id || {},
      status,
      date_joined,
      number_of_family_members,
    };
  });

  res.status(200).json({ occupants: formattedOccupants });
});

// get active occupant by evacuee id
exports.getActiveOccupantById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid evacuee ID" });
  }

  const occupant = await EvacuationCenterOccupants.findOne({
    evacuee_id: id,
    status: "Active"
  })
    .populate("evacuee_id")
    .populate("evacuation_center_id")
    .populate("assigned_area", "area_name")
    .lean();

  if (!occupant) {
    return res.status(200).json({ message: "No active occupant found for this evacuee" });
  }

  if (occupant.evacuee_id) {
    delete occupant.evacuee_id.password;
    delete occupant.evacuee_id.createdAt;
    delete occupant.evacuee_id.updatedAt;
    delete occupant.evacuee_id.__v;
  }

  res.status(200).json({ occupant });
});

// update occupant status
exports.updateOccupantStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Active", "Returned"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const occupant = await EvacuationCenterOccupants.findById(id);
  if (!occupant) {
    return res.status(404).json({ error: "Occupant not found" });
  }

  if (status === "Returned" && occupant.status !== "Returned") {
    const familyCount = occupant.number_of_family_members || 1; 

    // remove from evac center
    await EvacuationCenter.findByIdAndUpdate(
      occupant.evacuation_center_id,
      { $inc: { taken_slots: -familyCount } }
    );

    // update occupant from occupant in area 
    const updatedArea = await CenterArea.findOneAndUpdate(
      {
        evacuation_center_id: occupant.evacuation_center_id,
        "occupants.evacuee_id": occupant.evacuee_id
      },
      {
        $pull: { occupants: { evacuee_id: occupant.evacuee_id } },
        $set: { status: "Unoccupied" } 
      },
      { new: true }
    );
    
    // update isActive status of evac reg to false
    await EvacuationRegistration.findOneAndUpdate(
      {
        evacuee_id: occupant.evacuee_id,
        evacuation_center_id: occupant.evacuation_center_id,
        status: "Approved" 
      },
      {
        isActive: false
      }
    );
    
    occupant.date_returned = new Date();
  }

  occupant.status = status;
  await occupant.save();

  res.json({ message: "Occupant status updated successfully" });
});

// // delete occupant
// exports.deleteOccupantById = asyncHandler(async (req, res) => {
//   const occupant = await EvacuationCenterOccupants.findByIdAndDelete(req.params.id);
//   if (!occupant) return res.status(404).json({ error: "Occupant not found" });

//   res.json({ message: "Occupant deleted successfully" });
// });