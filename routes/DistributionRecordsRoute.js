const express = require('express');
const router = express.Router();
const DistributionController = require('../controllers/DistributionRecordsController');

router.post('/', DistributionController.distributeSupplies);
router.get('/', DistributionController.getAllDistributionRecords);
router.get('/center/:id', DistributionController.getCenterDistributions);
router.get('/evacuee/:id', DistributionController.getEvacueeDistributions);

module.exports = router;
