const express = require('express');
const router = express.Router();
const EvacuationCenterOccupantsController = require('../controllers/EvacuationCenterOccupantsController');

// router.post('/', EvacuationCenterOccupantsController.addOccupant);
router.get('/', EvacuationCenterOccupantsController.getAllOccupants);
router.get('/:id', EvacuationCenterOccupantsController.getOccupantById);
router.get('/center/:id', EvacuationCenterOccupantsController.getOccupantsByCenterId);
router.patch('/:id', EvacuationCenterOccupantsController.updateOccupant);
router.delete('/:id', EvacuationCenterOccupantsController.deleteOccupantById);  

module.exports =router;