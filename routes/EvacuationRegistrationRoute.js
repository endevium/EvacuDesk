const express = require('express');
const router = express.Router();
const EvacuationRegistrationController = require('../controllers/EvacuationRegistrationController');
const { Evacuee, AdminAndEvacuationCenter } = require("../middlewares/authGroup");

router.get('/', ...AdminAndEvacuationCenter, EvacuationRegistrationController.getRegistrations);
router.get('/:id', EvacuationRegistrationController.getRegistrationById);
// router.get('/evacuee/:id', EvacuationRegistrationController.getRegistrationByEvacueeId);
router.get('/pending/evacuee/:id', EvacuationRegistrationController.getPendingRegistrationsByEvacueeId);
router.get('/approved/evacuee/:id', EvacuationRegistrationController.getApprovedRegistrationsByEvacueeId);
router.get('/center/:id', ...AdminAndEvacuationCenter, EvacuationRegistrationController.getRegistrationByCenterId);
router.post('/', ...Evacuee, EvacuationRegistrationController.registerEvacuee);
router.patch('/:id', ...AdminAndEvacuationCenter, EvacuationRegistrationController.updateRegistrationStatus);
// router.delete('/:id', EvacuationRegistrationController.deleteRegistration);

module.exports = router;
