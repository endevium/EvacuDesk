const express = require('express');
const router = express.Router();
const PushSubscriptionController = require('../controllers/PushSubscriptionController');

router.post('/', PushSubscriptionController.createSubscription);
router.delete('/', PushSubscriptionController.deleteSubscription);

module.exports = router;
