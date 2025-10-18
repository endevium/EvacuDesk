const express = require("express");
const router = express.Router();
const EvacuationCenterController = require("../controllers/EvacuationCenterController");
const upload = require("../middlewares/uploads"); 
const { Admin, AdminAndEvacuationCenter } = require("../middlewares/authGroup");

router.get("/", EvacuationCenterController.getEvacuationCenters);
router.get("/:id", EvacuationCenterController.getEvacuationCenterById);

router.post("/", ...Admin, upload.single("image"), EvacuationCenterController.createEvacuationCenter);
router.post("/login", EvacuationCenterController.loginEvacuationCenter);
router.patch("/:id", ...AdminAndEvacuationCenter, upload.single("image"), EvacuationCenterController.updateEvacuationCenter);
router.delete("/:id", ...Admin, EvacuationCenterController.deleteEvacuationCenterById);

module.exports = router;
