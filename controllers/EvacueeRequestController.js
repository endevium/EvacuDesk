const EvacueeRequest = require('../models/EvacueeRequestModel');
const EvacuationCenter = require('../models/EvacuationCenterModel');
const Evacuee = require('../models/EvacueeModel');
const mongoose = require('mongoose');
const { createNotification } = require('./NotificationController');
const asyncHandler = require('../utils/asyncHandler');

// create evacuee request
exports.createRequest = asyncHandler(async (req, res) => {
  const { evacuee_id, evacuation_center_id, request_type, description, quantity } = req.body;

  if (!evacuee_id || !evacuation_center_id || !request_type || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (
    !mongoose.Types.ObjectId.isValid(evacuee_id) ||
    !mongoose.Types.ObjectId.isValid(evacuation_center_id)
  ) {
    return res.status(400).json({ error: 'Invalid Evacuee ID or Evacuation Center ID' });
  }

  const existingRequest = await EvacueeRequest.findOne({
        evacuee_id,
        evacuation_center_id,
        status: 'pending'
      });

  if (existingRequest) {
    return res.status(400).json({ error: 'You still have a pending request' });
  }

  await EvacueeRequest.create({
    evacuee_id, 
    evacuation_center_id,
    request_type, 
    description, 
    quantity,
  });

  // create request notification for the evacuation center
  try {
    const evac = await Evacuee.findById(evacuee_id).select('first_name last_name');
    await createNotification({
      title: 'New evacuee request',
      body: `${evac.first_name} ${evac.last_name} submitted a ${request_type} request`,
      recipient_id: evacuation_center_id,
      recipient_role: 'EvacuationCenter',
      meta: { request_type, quantity }
    });
  } catch (err) {
    console.error('Failed to notify center about request:', err.message || err);
  }

  res.status(201).json({ message: 'Request created successfully' });
});

// get all requests
exports.getAllRequests = asyncHandler(async (req, res) => {
  const requests = await EvacueeRequest.find()
    .populate('evacuee_id', 'first_name last_name')
    .populate('evacuation_center_id', 'name address');

  if (requests.length === 0) {
    return res.status(404).json({ message: "No evacuee requests found" });
  }
    
  res.json(requests);
});

// get requests by center ID
exports.getRequestsByCenterId = asyncHandler(async (req, res) => {
  const { centerId } = req.params;

  const centerExists = await EvacuationCenter.findById(centerId);
  if (!centerExists) {
    return res.status(404).json({ error: "Evacuation center not found" });
  }

  const requests = await EvacueeRequest.find({ evacuation_center_id: centerId })
    .populate('evacuee_id', 'first_name last_name')
    .populate('evacuation_center_id', 'name address');

  res.json(requests);
});

// get requests by evacuee ID and center ID
exports.getRequestsByEvacueeAndCenter = asyncHandler(async (req, res) => {
  const { evacueeId, centerId } = req.params;

  const evacueeExists = await Evacuee.findById(evacueeId);
  if (!evacueeExists) {
    return res.status(404).json({ error: 'Evacuee not found' });
  }

  const centerExists = await EvacuationCenter.findById(centerId);
  if (!centerExists) {
    return res.status(404).json({ error: 'Evacuation center not found' });
  }

  const requests = await EvacueeRequest.find({
    evacuee_id: evacueeId,
    evacuation_center_id: centerId
  });

  if (requests.length === 0) {
    return res.status(404).json({ message: 'You do not have any requests in this center' });
  }

  res.json(requests);
});

// get request by ID
exports.getRequestById = asyncHandler(async (req, res) => {
  const request = await EvacueeRequest.findById(req.params.id)
    .populate('evacuee_id', 'first_name last_name')
    .populate('evacuation_center_id', 'name');
  if (!request) return res.status(404).json({ error: 'Request not found' });

  res.json(request);
});

// update request status by ID
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !['Pending', 'Fulfilled', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  
  const request = await EvacueeRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!request) return res.status(404).json({ error: 'Request not found' }); 

  // update request status notification for evacuee
  try {
    await Evacuee.findById(request.evacuee_id).select('first_name last_name');
    await createNotification({
      title: `Request ${status}`,
      body: `Your request has been ${status.toLowerCase()}`,
      recipient_id: request.evacuee_id,
      recipient_role: 'Evacuee',
      meta: { request_id: request._id, status }
    });
  } catch (err) {
    console.error('Failed to notify evacuee about request status:', err.message || err);
  }

  res.json({ message: 'Request status updated successfully' });
});

// delete request by ID
exports.deleteRequest = asyncHandler(async (req, res) => {
  const request = await EvacueeRequest.findByIdAndDelete(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  res.json({ message: 'Request deleted successfully' });
});