const express = require('express');
const router = express.Router();
const EvacueeRequestController = require('../controllers/EvacueeRequestController');
const { Evacuee, AdminAndEvacuationCenter, AllUsers } = require("../middlewares/authGroup");

router.post('/', ...Evacuee, EvacueeRequestController.createRequest);
router.get('/', ...AdminAndEvacuationCenter, EvacueeRequestController.getAllRequests);
router.get('/center/:id', ...AdminAndEvacuationCenter, EvacueeRequestController.getRequestsByCenterId);
router.get('/evacuee/:evacueeId/center/:centerId', ...AllUsers, EvacueeRequestController.getRequestsByEvacueeAndCenter);
router.get('/:id', ...AllUsers, EvacueeRequestController.getRequestById);
router.patch('/status/:id', ...AdminAndEvacuationCenter, EvacueeRequestController.updateRequestStatus);
router.delete('/:id', ...AdminAndEvacuationCenter, EvacueeRequestController.deleteRequest);

module.exports = router;
