const express = require('express');
const router = express.Router();
const DistributionRecordsController = require('../controllers/DistributionRecordsController');

router.post('/', DistributionRecordsController.createDistributionRecord);
router.get('/', DistributionRecordsController.getAllDistributionRecords);
router.get('/:id', DistributionRecordsController.getDistributionRecordById);
// router.patch('/:id', DistributionRecordsController.updateDistributionRecord);
router.delete('/:id', DistributionRecordsController.deleteDistributionRecord);

module.exports = router;
