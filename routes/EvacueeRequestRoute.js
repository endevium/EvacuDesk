const express = require('express');
const router = express.Router();
const EvacueeRequestController = require('../controllers/EvacueeRequestController');

router.post('/', EvacueeRequestController.createRequest);
router.get('/', EvacueeRequestController.getAllRequests);
router.get('/center/:id', EvacueeRequestController.getRequestsByCenterId);
router.get('/evacuee/:evacueeId/center/:centerId', EvacueeRequestController.getRequestsByEvacueeAndCenter);
router.get('/:id', EvacueeRequestController.getRequestById);
router.patch('/status/:id', EvacueeRequestController.updateRequestStatus);
router.delete('/:id', EvacueeRequestController.deleteRequest);

module.exports = router;
