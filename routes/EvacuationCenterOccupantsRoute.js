const express = require('express');
const router = express.Router();
const EvacuationCenterOccupantsController = require('../controllers/EvacuationCenterOccupantsController');
const { AdminAndStaff } = require("../middlewares/authGroup");

router.get('/', EvacuationCenterOccupantsController.getAllOccupants);
router.get('/:id', EvacuationCenterOccupantsController.getOccupantById);
router.get('/center/:id', EvacuationCenterOccupantsController.getOccupantsByCenterId);

// router.post('/', AdminAndStaff, EvacuationCenterOccupantsController.addOccupant);
// router.patch('/:id', AdminAndStaff, EvacuationCenterOccupantsController.updateOccupantDetails);
router.patch('/status/:id', AdminAndStaff, EvacuationCenterOccupantsController.updateOccupantStatus);
router.delete('/:id', AdminAndStaff, EvacuationCenterOccupantsController.deleteOccupantById);

module.exports =router;