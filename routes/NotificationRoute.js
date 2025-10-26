const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// router.get('/', NotificationController.getNotifications);
// router.patch('/read/:id', NotificationController.markAsRead);
router.get('/center/:id', NotificationController.getEvacuationCenterNotifications)
router.get('/evacuee/:id', NotificationController.getEvacueeNotifications)

module.exports = router;
