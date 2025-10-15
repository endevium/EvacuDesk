const mongoose = require("mongoose");
const EvacuationCenter = require('../models/EvacuationCenterModel')
const EvacuationCenterOccupants = require("../models/EvacuationCenterOccupantsModel");

// 
// // add occupant to a center
// exports.addOccupant = async (req, res) => {
//   try {
//     const { evacuation_center_id, evacuee_id, number_of_family_members, family_members } = req.body;

//     if (!evacuation_center_id || !evacuee_id) {
//       return res.status(400).json({ error: "Evacuation center and evacuee ID are required" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(evacuation_center_id) || !mongoose.Types.ObjectId.isValid(evacuee_id)) {
//       return res.status(400).json({ error: "The evacuation center or evacuee does not exist" });
//     }

//     await EvacuationCenterOccupants.create({
//       evacuation_center_id, evacuee_id, number_of_family_members, family_members, ...req.body
//     });

//     res.status(201).json({ message: "The occupant was added successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// get all occupants
exports.getAllOccupants = async (req, res) => {
  try {
    const occupants = await EvacuationCenterOccupants.find()
    //   .populate("evacuation_center_id")
    //   .populate("evacuee_id");
    res.json(occupants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get occupants by evacuation center id
exports.getOccupantsByCenterId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid evacuation center ID" });
    }

    const occupants = await EvacuationCenterOccupants.find({ evacuation_center_id: id })
      .populate("evacuee_id")
      .lean(); 

    const formattedOccupants = occupants.map(({ _id, evacuee_id, status, date_joined, date_left, family_members = [] }) => {
      if (evacuee_id) {
        delete evacuee_id.password;
        delete evacuee_id.createdAt;
        delete evacuee_id.updatedAt;
        delete evacuee_id.__v;
      }

      return { _id, evacuee: evacuee_id || {}, status, date_joined, date_left, family_members };
    });

    res.status(200).json({ evacuation_center_id: id, occupants: formattedOccupants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get occupant by id
exports.getOccupantById = async (req, res) => {
  try {
    const occupant = await EvacuationCenterOccupants.findById(req.params.id)
    //   .populate("evacuation_center_id", "name address capacity")

    if (!occupant) return res.status(404).json({ error: "Occupant not found" });

    res.json(occupant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // update occupant details
// exports.updateOccupantDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };

//     const occupant = await EvacuationCenterOccupants.findById(id);
//     if (!occupant) {
//       return res.status(404).json({ error: "Occupant not found" });
//     }

//     if (updateData.status === "left") {
//       if (!occupant.date_left) {
//         updateData.date_left = new Date();
//       }

//       const familyCount = occupant.family_members?.length
//         ? occupant.family_members.length + 1 
//         : 1;

//       await EvacuationCenter.findByIdAndUpdate(
//         occupant.evacuation_center_id,
//         { $inc: { taken_slots: -familyCount } }
//       );
//     }

//   await EvacuationCenterOccupants.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     res.json({ message: "Occupant updated successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// update occupant status
exports.updateOccupantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "left"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const occupant = await EvacuationCenterOccupants.findById(id);
    if (!occupant) {
      return res.status(404).json({ error: "Occupant not found" });
    }

    if (status === "left" && occupant.status !== "left") {
      const familyCount = occupant.family_members?.length || 0;

      await EvacuationCenter.findByIdAndUpdate(
        occupant.evacuation_center_id,
        { $inc: { taken_slots: -familyCount } }
      );
      
      occupant.date_left = new Date();
    }

    occupant.status = status;
    await occupant.save();

    res.json({ message: "Occupant status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete occupant
exports.deleteOccupantById = async (req, res) => {
  try {
    const occupant = await EvacuationCenterOccupants.findByIdAndDelete(req.params.id);
    if (!occupant) return res.status(404).json({ error: "Occupant not found" });

    res.json({ message: "Occupant deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
