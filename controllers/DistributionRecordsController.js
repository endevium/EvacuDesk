const DistributionRecord = require('../models/DistributionRecordsModel');
const Evacuee = require('../models/EvacueeModel');
const EvacuationCenter = require('../models/EvacuationCenterModel');
const asyncHandler = require('../utils/asyncHandler');

// create distribution record
exports.createDistributionRecord = asyncHandler(async (req, res) => {
  const { evacuee_id, evacuation_center_id, relief_type, quantity } = req.body;

  // evacuee exists
  const evacuee = await Evacuee.findById(evacuee_id);
  if (!evacuee) {
    return res.status(404).json({ message: 'Evacuee not found' });
  }

  // evacuation center exists
  const center = await EvacuationCenter.findById(evacuation_center_id);
  if (!center) {
    return res.status(404).json({ message: 'Evacuation center not found' });
  }

  const distribution = await DistributionRecord.create({
    evacuee_id,
    evacuation_center_id,
    relief_type,
    quantity,
  });

  res.status(201).json({ message: 'Record created successfully' });
});

// get all distribution records
exports.getAllDistributionRecords = asyncHandler(async (req, res) => {
  const records = await DistributionRecord.find()
    .populate('evacuee_id', 'first_name last_name number_of_family_members')
    .populate('evacuation_center_id', 'name');

  res.json(records);
});

// get records by id
exports.getDistributionRecordById = asyncHandler(async (req, res) => {
  const record = await DistributionRecord.findById(req.params.id)
    .populate('evacuee_id', 'first_name last_name')
    .populate('evacuation_center_id', 'name');

  if (!record) {
    return res.status(404).json({ message: 'Record not found' });
  }

  res.json(record);
});

// update record by id
// exports.updateDistributionRecord = asyncHandler(async (req, res) => {
//   const updated = await DistributionRecord.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     { new: true, runValidators: true }
//   );

//   if (!updated) {
//     return res.status(404).json({ message: 'Record not found' });
//   }

//   res.json({ message: "Reco"});
// });

// delete distribution record
exports.deleteDistributionRecord = asyncHandler(async (req, res) => {
  const record = await DistributionRecord.findByIdAndDelete(req.params.id);

  if (!record) {
    return res.status(404).json({ message: 'Record not found' });
  }

  res.json({ message: 'Record deleted successfully' });
});
