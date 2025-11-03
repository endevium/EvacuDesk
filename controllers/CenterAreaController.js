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

  const existingAreas = await CenterArea.find({ evacuation_center_id });
  const totalUsedCapacity = existingAreas.reduce((sum, a) => sum + (a.capacity || 0), 0);

  let finalAreaName;
  let areaData = { evacuation_center_id, occupants: [] };
  let newAreaCapacity = 0;

  switch(area_type) {
    case "Room":
      if (!area_name || !capacity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      finalAreaName = area_name;
      newAreaCapacity = capacity;
      areaData.capacity = capacity;
      break;

    case "Tent":
      const lastArea = await CenterArea.findOne({ evacuation_center_id, area_type: "Tent" }).sort({ createdAt: -1 });
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

      const tentCapacities = { Small: 3, Medium: 5, Large: 8 };
      newAreaCapacity = tentCapacities[size];
      areaData.capacity = newAreaCapacity;
      break;

    case "Zone":
      const zoneOptions = ["Bleachers", "Stage", "Gym Floor"];
      if (!area_name || !zoneOptions.includes(area_name)) {
        return res.status(400).json({ error: `Area name must be one of ${zoneOptions.join(", ")}` });
      }
      if (!capacity) return res.status(400).json({ error: "Missing required fields." });

      finalAreaName = area_name;
      newAreaCapacity = capacity;
      areaData.capacity = capacity;
      break;

    default:
      return res.status(400).json({ error: "Invalid request" });
  }

  if (totalUsedCapacity + newAreaCapacity > evacCenter.capacity) {
    const remainingCapacity = evacCenter.capacity - totalUsedCapacity;
    return res.status(400).json({
      error: `Cannot create this area. It exceeds the evacuation center capacity. Only ${remainingCapacity} space(s) remaining.`,
    });
  }

  areaData.area_name = finalAreaName;
  areaData.area_type = area_type; 

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
  const { evacuee_id } = req.body;

  if (!evacuee_id) {
    return res.status(400).json({ error: "Evacuee ID is required" });
  }

  const area = await CenterArea.findById(id);
  if (!area) {
    return res.status(404).json({ error: "Center area not found." });
  }

  // check if evacuee already assigned to any area in this center
  const alreadyAssigned = await CenterArea.findOne({
    evacuation_center_id: area.evacuation_center_id,
    "occupants.evacuee_id": evacuee_id
  });

  if (alreadyAssigned) {
    return res.status(400).json({ error: "This evacuee is already assigned to another area in this center." });
  }

  // verify evacuee is an active occupant
  const activeOccupant = await EvacuationCenterOccupants.findOne({
    evacuee_id,
    evacuation_center_id: area.evacuation_center_id,
    status: "Active"
  });

  if (!activeOccupant) {
    return res.status(400).json({ error: "This evacuee is not an active occupant in this evacuation center." });
  }

  const familySize = activeOccupant.number_of_family_members;

  // calculate current occupancy BEFORE adding
  const currentOccupancy = area.occupants.reduce(
    (sum, occ) => sum + (occ.number_of_family_members || 0),
    0
  );

  // calculate remaining capacity
  const remainingCapacity = area.capacity - currentOccupancy;

  // block adding if cannot fit
  if (familySize > remainingCapacity) {
    return res.status(400).json({
      error: `Cannot assign this family. Only ${remainingCapacity} space(s) left in this area.`
    });
  }

  area.occupants.push({ evacuee_id, number_of_family_members: familySize });
  area.occupied_slot = currentOccupancy + familySize;

  // update area status
  if (area.occupied_slot >= area.capacity) {
    area.status = "Occupied";
  } else if (area.occupied_slot > 0) {
    area.status = "Occupied";
  } else {
    area.status = "Unoccupied";
  }

  await area.save();

  // link evacuee to this area
  await EvacuationCenterOccupants.findOneAndUpdate(
    { evacuee_id, evacuation_center_id: area.evacuation_center_id },
    { assigned_area: area._id }
  );

  res.json({ message: "Family assigned to the area successfully." });
});


// remove occupant from area
exports.removeOccupantFromArea = asyncHandler(async (req, res) => {
  const { id } = req.params; 

  const area = await CenterArea.findById(id);
  if (!area) {
    return res.status(404).json({ error: "Center area not found." });
  }

  // check current occupant
  if (area.occupants.length === 0) {
    return res.status(400).json({ error: "This area has no assigned family." });
  }

  // clear the occupant list, statu, slot
  area.occupants = [];
  area.occupied_slot = 0;
  area.status = "Unoccupied";

  await area.save();

  res.json({ message: "Family has been removed in the area" });
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