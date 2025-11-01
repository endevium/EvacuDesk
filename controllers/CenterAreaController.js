const CenterArea = require("../models/CenterAreaModel");
const EvacuationCenter = require("../models/EvacuationCenterModel");
const EvacuationCenterOccupants = require("../models/EvacuationCenterOccupantsModel"); 
const Evacuee = require("../models/EvacueeModel");
const Request = require("../models/StockRequestModel");
const asyncHandler = require("../utils/asyncHandler");

// create center area
exports.createCenterArea = asyncHandler(async (req, res) => {
  const { evacuation_center_id, capacity, area_name, size, area_type } = req.body;

  if (!evacuation_center_id) {
    return res.status(400).json({ error: "Missing evacuation_center_id" });
  }

  const evacCenter = await EvacuationCenter.findById(evacuation_center_id);
  if (!evacCenter) {
    return res.status(404).json({ error: "Evacuation center not found." });
  }

  let finalAreaName;
  let areaData = { evacuation_center_id, occupants: [] };

  switch(area_type) {
    case "Room":
      if (!area_name || !capacity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      finalAreaName = area_name;
      areaData.capacity = capacity;
      break;

    case "Tent":
      const lastArea = await CenterArea.findOne({ evacuation_center_id }).sort({ createdAt: -1 });
      let nextNumber = 1;
      if (lastArea && lastArea.area_name) {
        const match = lastArea.area_name.match(/\d+/);
        if (match) nextNumber = parseInt(match[0]) + 1;
      }
      finalAreaName = `Tent ${nextNumber}`;

      if (!size || !["Small", "Medium", "Large"].includes(size)) {
        return res.status(400).json({ error: "Tent size must be Small, Medium, or Large" });
      }
      areaData.size = size;
      break;

    case "Zone":
      const zoneOptions = ["Bleachers", "Stage", "Gym Floor"];
      if (!area_name || !zoneOptions.includes(area_name)) {
        return res.status(400).json({ error: `Area name must be one of ${zoneOptions.join(", ")}` });
      }
      if (!capacity) return res.status(400).json({ error: "Missing required fields." });

      finalAreaName = area_name;
      areaData.capacity = capacity;
      break;

    default:
      return res.status(400).json({ error: "Invalid request" });
  }

  areaData.area_name = finalAreaName;
  areaData.area_type = evacCenter.area_type; 

  await CenterArea.create(areaData);

  res.status(201).json({ message: "Center area created successfully." });
});

// get all center areas by center id
exports.getCenterAreasByCenterId = asyncHandler(async (req, res) => {
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
});

// get center area by id
exports.getCenterAreaById = asyncHandler(async (req, res) => {
  const area = await CenterArea.findById(req.params.id)
    .populate("occupants.evacuee_id", "first_name last_name sex phone_number street_number barangay city province medical_conditions")
    .populate("evacuation_center_id", "name type address contact_number");

  if (!area) return res.status(404).json({ error: "Center area not found." });
  res.json(area);
});

// add occupant to area
exports.addOccupantToArea = asyncHandler(async (req, res) => {
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
    return res.status(400).json({ error: "This evacuee is already assigned to an area" });
  }

  // check if area has enough capacity
  let maxCapacity = area.capacity; // Room/Zone
  if (area.size) {
    const sizeCapacityMap = { Small: 5, Medium: 10, Large: 15 };
    maxCapacity = sizeCapacityMap[area.size];
  }

  if (newTotalOccupancy > maxCapacity) {
    return res.status(400).json({ 
      error: `Area cannot accommodate ${number_of_family_members} more people. Only ${maxCapacity - currentOccupancy} spaces available.` 
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

  await EvacuationCenterOccupants.findOneAndUpdate(
    { evacuee_id, evacuation_center_id: area.evacuation_center_id },
    { assigned_area: area._id }
  );

  res.json({ message: "Occupant added to area successfully." });
});

// remove occupant from area
exports.removeOccupantFromArea = asyncHandler(async (req, res) => {
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
});

// get all center areas (for admin)
exports.getCenterAreas = asyncHandler(async (req, res) => {
  const areas = await CenterArea.find()
    .populate("evacuation_center_id", "name type address")
    .populate("occupants.evacuee_id", "first_name last_name");
  res.json(areas);
});

// delete center area
exports.deleteCenterArea = asyncHandler(async (req, res) => {
  const area = await CenterArea.findByIdAndDelete(req.params.id);
  if (!area) return res.status(404).json({ error: "Center area not found." });

  res.json({ message: "Center area deleted successfully." });
});