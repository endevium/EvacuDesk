const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DashboardController");

router.get("/evacuee/:id", DashboardController.getEvacueeDashboard);
router.get("/center/:id", DashboardController.getEvacuationCenterDashboard);
router.get("/admin", DashboardController.getAdminDashboard);

module.exports = router;
