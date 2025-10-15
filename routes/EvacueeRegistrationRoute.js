const express = require('express');
const router = express.Router();
const EvacueeRegistrationController = require('../controllers/EvacueeRegistrationController');

router.post('/', EvacueeRegistrationController.registerEvacuee);
router.get('/', EvacueeRegistrationController.getRegistrations);
router.get('/:id', EvacueeRegistrationController.getRegistrationById);
router.get('/center/:id', EvacueeRegistrationController.getRegistrationByCenterId);
router.patch('/:id', EvacueeRegistrationController.updateRegistrationStatus);
// router.delete('/:id', EvacueeRegistrationController.deleteRegistration);

module.exports = router;
