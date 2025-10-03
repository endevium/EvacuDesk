const EvacuationCenterOccupants = require("../models/EvacuationCenterOccupantsModel");
const mongoose = require("mongoose");

// add occupant to a center
exports.addOccupant = async (req, res) => {
  try {
    const { evacuation_center_id, evacuee_id } = req.body;
    // validations
    if (!evacuation_center_id || !evacuee_id) {
      return res.status(400).json({ error: "Evacuation center and evacuee ID are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(evacuation_center_id) || !mongoose.Types.ObjectId.isValid(evacuee_id)) {
      return res.status(400).json({ error: "The evacuation center or evacuee does not exist" });
    }
    // proceed 
    const occupant = await EvacuationCenterOccupants.create({
      evacuation_center_id,
      evacuee_id,
      ...req.body
    });
    res.status(201).json({ message: "Occupant added successfully", occupant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all occupants
exports.getOccupants = async (req, res) => {
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
    //validations
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Evacuation center ID does not exist" });
    }
    // proceed
    const occupants = await EvacuationCenterOccupants.find({ evacuation_center_id: id })
      .populate("evacuee_id");
    const center_occupants = {
  evacuation_center_id: id,
  occupants: occupants.map(o => {
    const evacuee = o.evacuee_id?.toObject?.() || {};
    
    // remove sensitive fields
    delete evacuee.password;
    delete evacuee.createdAt;
    delete evacuee.updatedAt;
    delete evacuee.__v;

    return { _id: o._id, evacuee, status: o.status, date_joined: o.date_joined, date_left: o.date_left };
  })
};
res.json(center_occupants);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// // get occupant by id
// exports.getOccupantById = async (req, res) => {
//   try {
//     const occupant = await EvacuationCenterOccupants.findById(req.params.id)
//     //   .populate("evacuation_center_id", "name address capacity")
//     //   .populate("evacuee_id", "first_name last_name");

//     if (!occupant) return res.status(404).json({ error: "Occupant not found" });

//     res.json(occupant);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// update occupant details
exports.updateOccupant = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // set date_left of occupant 
    if (updateData.status === "approved" && !updateData.date_left) {
      updateData.date_left = new Date();
    }

    const occupant = await EvacuationCenterOccupants.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!occupant) return res.status(404).json({ error: "Occupant not found" });

    res.json({ message: "Occupant updated successfully" });
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
