const CenterArea = require("../models/CenterAreaModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");
const EvacuationCenterOccupants = require("../models/EvacuationCenterOccupantsModel"); 
const Evacuee = require("../models/EvacueeModel");
const Request = require("../models/EvacueeRequestModel");

// create center area
exports.createCenterArea = async (req, res) => {
  try {
    const { evacuation_center_id, capacity } = req.body;

    if (!evacuation_center_id || !capacity) {
      return res.status(400).json({ error: "Evacuation center ID and capacity are required" });
    }

    const evacCenter = await EvacuationCenter.findById(evacuation_center_id);
    if (!evacCenter) {
      return res.status(404).json({ error: "Evacuation center not found." });
    }

    // auto increment area_number by highest number
    const lastArea = await CenterArea.findOne(
      { evacuation_center_id },
      { area_number: 1 },
      { sort: { area_number: -1 } }
    );
    
    let nextAreaNumber = 1;
    if (lastArea && lastArea.area_number) {
      const match = lastArea.area_number.match(/\d+/);
      if (match) {
        nextAreaNumber = parseInt(match[0]) + 1;
      }
    }

    const areaNumber = `Area ${nextAreaNumber}`;
    
    await CenterArea.create({
      area_number: areaNumber,
      evacuation_center_id,
      capacity,
      occupants: [] 
    });

    res.status(201).json({ message: "Center area created successfully.", area_number: areaNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all center areas by center id
exports.getCenterAreasByCenterId = async (req, res) => {
  try {
    const { id } = req.params; 

    const areas = await CenterArea.find({ evacuation_center_id: id })
      .populate("occupants.evacuee_id", "first_name last_name sex phone_number")
      .populate("evacuation_center_id", "name type address");
    
    // get request counts for all occupants
    const areasWithRequestCounts = await Promise.all(
      areas.map(async (area) => {
        const occupantsWithRequests = await Promise.all(
          area.occupants.map(async (occupant) => {
            if (!occupant.evacuee_id) {
              return {
                ...occupant.toObject ? occupant.toObject() : occupant,
                request_count: 0
              };
            }

            // count requests for an evacuee in a center
            const requestCount = await Request.countDocuments({
              evacuee_id: occupant.evacuee_id._id,
              evacuation_center_id: id,
              status: { $in: ["Pending", "Approved", "Fulfilled"] }
            });

            return {
              ...occupant.toObject ? occupant.toObject() : occupant,
              request_count: requestCount
            };
          })
        );

        return {
          ...area.toObject ? area.toObject() : area,
          occupants: occupantsWithRequests
        };
      })
    );
    
    res.json(areasWithRequestCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get center area by id
exports.getCenterAreaById = async (req, res) => {
  try {
    const area = await CenterArea.findById(req.params.id)
      .populate("occupants.evacuee_id", "first_name last_name sex phone_number street_number barangay city province medical_conditions")
      .populate("evacuation_center_id", "name type address contact_number");

    if (!area) return res.status(404).json({ error: "Center area not found." });
    res.json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// add occupant to area
exports.addOccupantToArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { evacuee_id, number_of_family_members } = req.body;

    if (!evacuee_id || !number_of_family_members) {
      return res.status(400).json({ error: "Evacuee ID and number of family members are required" });
    }

    const area = await CenterArea.findById(id);
    if (!area) {
      return res.status(404).json({ error: "Center area not found." });
    }

    // check if evacuee is already assigned to any area in this center
    const alreadyAssigned = await CenterArea.findOne({
      evacuation_center_id: area.evacuation_center_id,
      'occupants.evacuee_id': evacuee_id
    });

    if (alreadyAssigned) {
      return res.status(400).json({ error: "This evacuee is already assigned to another area in this center." });
    }

    // check if area has enough capacity
    const currentOccupancy = area.occupants.reduce((total, occupant) => total + occupant.number_of_family_members, 0);
    const newTotalOccupancy = currentOccupancy + number_of_family_members;

    if (newTotalOccupancy > area.capacity) {
      return res.status(400).json({ 
        error: `Area cannot accommodate ${number_of_family_members} more people. Only ${area.capacity - currentOccupancy} spaces available.` 
      });
    }

    // check if evacuee is an active occupant in the center
    const activeOccupant = await EvacuationCenterOccupants.findOne({
      evacuee_id,
      evacuation_center_id: area.evacuation_center_id,
      status: "Active"
    });

    if (!activeOccupant) {
      return res.status(400).json({ error: "This evacuee is not an active occupant in this evacuation center." });
    }

    // add occupant to area
    area.occupants.push({
      evacuee_id,
      number_of_family_members
    });

    await area.save();

    res.json({ message: "Occupant added to area successfully." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// remove occupant from area
exports.removeOccupantFromArea = async (req, res) => {
  try {
    const { id, occupantId } = req.params;

    const area = await CenterArea.findById(id);
    if (!area) {
      return res.status(404).json({ error: "Center area not found." });
    }

    // find and remove the occupant
    const occupantIndex = area.occupants.findIndex(occupant => 
      occupant._id.toString() === occupantId
    );

    if (occupantIndex === -1) {
      return res.status(404).json({ error: "Occupant not found in this area." });
    }

    area.occupants.splice(occupantIndex, 1);
    await area.save();

    res.json({ message: "Occupant removed from area successfully." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// get all center areas (for admin)
exports.getCenterAreas = async (req, res) => {
  try {
    const areas = await CenterArea.find()
      .populate("evacuation_center_id", "name type address")
      .populate("occupants.evacuee_id", "first_name last_name");
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
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