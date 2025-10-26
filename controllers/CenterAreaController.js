const CenterArea = require("../models/CenterAreaModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");
const EvacuationCenterOccupants = require("../models/EvacuationCenterOccupantsModel"); 
const Evacuee = require("../models/EvacueeModel");

// create center area
exports.createCenterArea = async (req, res) => {
  try {
    const { area_number, evacuation_center_id, evacuee_id, number_of_family_member } = req.body;

    if (!area_number || !evacuation_center_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const evacCenter = await EvacuationCenter.findById(evacuation_center_id);
    if (!evacCenter) {
      return res.status(404).json({ error: "Evacuation center not found." });
    }

    await CenterArea.create({
      area_number,
      evacuation_center_id
    });

    res.status(201).json({ message: "Center area created successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all center areas
exports.getCenterAreas = async (req, res) => {
  try {
    const areas = await CenterArea.find()
      .populate("evacuation_center_id", "_id name type staff_contact_number")
      .populate("evacuee_id", "first_name last_name");
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get center area by id
exports.getCenterAreaById = async (req, res) => {
  try {
    const area = await CenterArea.findById(req.params.id)
    //   .populate("evacuation_center_id", "evacuation_center_name address")
      .populate("evacuee_id", "first_name last_name number_of_family_members");

    if (!area) return res.status(404).json({ error: "Center area not found." });
    res.json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update center area
exports.updateCenterArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { evacuee_id, number_of_family_member } = req.body;

    const area = await CenterArea.findById(id);
    if (!area) {
      return res.status(404).json({ error: "Center area not found." });
    }

    if (evacuee_id) {
      // check if an active occupant
      const occupant = await EvacuationCenterOccupants.findOne({
        evacuee_id,
        evacuation_center_id: area.evacuation_center_id,
        status: "Active",
      });

      if (!occupant) {
        return res.status(400).json({ error: "This evacuee is not an active occupant in this evacuation center." });
      }

      // evacuee is already assigned to another area
      const alreadyAssigned = await CenterArea.findOne({
        evacuee_id,
        _id: { $ne: id },
      });

      if (alreadyAssigned) {
        return res.status(400).json({ error: "This evacuee is already assigned to another area." });
      }

      // assign evacuee to the area
      area.evacuee_id = evacuee_id;
      area.number_of_family_member = occupant.number_of_family_members;

      // update occupant assigned area
      occupant.assigned_area = area._id;
      await occupant.save();

    } else {
      // remove evacuee to the area
      if (area.evacuee_id) {
        const occupant = await EvacuationCenterOccupants.findOne({
          evacuee_id: area.evacuee_id,
          evacuation_center_id: area.evacuation_center_id,
          status: "Active",
        });

        if (occupant) {
          occupant.assigned_area = null;
          await occupant.save();
        }
      }

      area.evacuee_id = null;
      area.number_of_family_member = null;
    }

    await area.save();

    res.json({ message: "Center area updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// delete center area
exports.deleteCenterArea = async (req, res) => {
  try {
    const area = await CenterArea.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ error: "Center area not found." });

    res.json({ message: "Center area deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
