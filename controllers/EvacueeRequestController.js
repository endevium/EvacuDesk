const EvacueeRequest = require('../models/EvacueeRequestModel');
const mongoose = require('mongoose');

// create evacuee request
exports.createRequest = async (req, res) => {
  try {
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

    res.status(201).json({ message: 'Request created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await EvacueeRequest.find()
      .populate('evacuee_id', 'first_name last_name')
      .populate('evacuation_center_id', 'name address');
      
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get requests by center ID
exports.getRequestsByCenterId = async (req, res) => {
  try {
    const { centerId } = req.params;
    const requests = await EvacueeRequest.find({ evacuation_center_id: centerId })
      .populate('evacuee_id', 'first_name last_name')
      .populate('evacuation_center_id', 'name address');

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get requests by evacuee ID and center ID
exports.getRequestsByEvacueeAndCenter = async (req, res) => {
  try {
    const { evacueeId, centerId } = req.params;
    const requests = await EvacueeRequest.find({
      evacuee_id: evacueeId,
      evacuation_center_id: centerId
    })

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await EvacueeRequest.findById(req.params.id)
      .populate('evacuee_id', 'first_name last_name')
      .populate('evacuation_center_id', 'name');
    if (!request) return res.status(404).json({ error: 'Request not found' });

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update request status by ID
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'fulfilled', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const request = await EvacueeRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' }); 

    res.json({ message: 'Request status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete request by ID
exports.deleteRequest = async (req, res) => {
  try {
    const request = await EvacueeRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
