const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

router.get('/admin', NotificationController.getAdminNotifications);
// router.patch('/read/:id', NotificationController.markAsRead);
router.get('/center/:id', NotificationController.getEvacuationCenterNotifications)
router.get('/evacuee/:id', NotificationController.getEvacueeNotifications)

module.exports = router;
