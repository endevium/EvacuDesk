const express = require('express');
const router = express.Router();
const EvacuationRegistrationController = require('../controllers/EvacuationRegistrationController');

router.post('/', EvacuationRegistrationController.registerEvacuee);
router.get('/', EvacuationRegistrationController.getRegistrations);
router.get('/:id', EvacuationRegistrationController.getRegistrationById);
// router.get('/evacuee/:id', EvacuationRegistrationController.getRegistrationByEvacueeId);
router.get('/pending/evacuee/:id', EvacuationRegistrationController.getPendingRegistrationsByEvacueeId);
router.get('/approved/evacuee/:id', EvacuationRegistrationController.getApprovedRegistrationsByEvacueeId);
router.get('/center/:id', EvacuationRegistrationController.getRegistrationByCenterId);
router.patch('/:id', EvacuationRegistrationController.updateRegistrationStatus);
// router.delete('/:id', EvacuationRegistrationController.deleteRegistration);

module.exports = router;
