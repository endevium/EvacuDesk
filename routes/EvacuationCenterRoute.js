const express = require("express");
const router = express.Router();
const EvacuationCenterController = require("../controllers/EvacuationCenterController");
const upload = require("../middlewares/uploads"); 
const { Admin, AdminAndStaff } = require("../middlewares/authGroup");

router.get("/", EvacuationCenterController.getEvacuationCenters);
router.get("/pending", EvacuationCenterController.getPendingEvacuationCenters);
router.get("/:id", EvacuationCenterController.getEvacuationCenterById);

router.post("/", AdminAndStaff, upload.single("image"), EvacuationCenterController.createEvacuationCenter);
router.patch("/:id", AdminAndStaff, upload.single("image"), EvacuationCenterController.updateEvacuationCenter);
router.patch("/status/:id", Admin, EvacuationCenterController.updateEvacuationCenterStatus);
router.delete("/:id", Admin, EvacuationCenterController.deleteEvacuationCenterById);

module.exports = router;
