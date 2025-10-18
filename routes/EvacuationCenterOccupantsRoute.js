const express = require('express');
const router = express.Router();
const EvacuationCenterOccupantsController = require('../controllers/EvacuationCenterOccupantsController');
const { AdminAndEvacuationCenter } = require("../middlewares/authGroup");

router.get('/', EvacuationCenterOccupantsController.getAllOccupants);
router.get('/:id', EvacuationCenterOccupantsController.getOccupantById);
router.get('/center/:id', EvacuationCenterOccupantsController.getOccupantsByCenterId);

// router.post('/', ...AdminAndEvacuationCenter, EvacuationCenterOccupantsController.addOccupant);
// router.patch('/:id', ...AdminAndEvacuationCenter, EvacuationCenterOccupantsController.updateOccupantDetails);
router.patch('/status/:id', ...AdminAndEvacuationCenter, EvacuationCenterOccupantsController.updateOccupantStatus);
router.delete('/:id', ...AdminAndEvacuationCenter, EvacuationCenterOccupantsController.deleteOccupantById);

module.exports =router;