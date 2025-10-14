const express = require('express');
const router = express.Router();
const EvacueeRequestController = require('../controllers/EvacueeRequestController');
const { Evacuee, AdminAndStaff, AdminStaffAndEvacuee } = require("../middlewares/authGroup");

router.post('/', Evacuee, EvacueeRequestController.createRequest);
router.get('/', AdminAndStaff, EvacueeRequestController.getAllRequests);
router.get('/center/:id', AdminAndStaff, EvacueeRequestController.getRequestsByCenterId);
router.get('/evacuee/:evacueeId/center/:centerId', AdminStaffAndEvacuee, EvacueeRequestController.getRequestsByEvacueeAndCenter);
router.get('/:id', AdminStaffAndEvacuee, EvacueeRequestController.getRequestById);
router.patch('/status/:id', AdminAndStaff, EvacueeRequestController.updateRequestStatus);
router.delete('/:id', AdminAndStaff, EvacueeRequestController.deleteRequest);

module.exports = router;
