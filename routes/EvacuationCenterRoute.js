const express = require("express");
const router = express.Router();
const EvacuationCenterController = require("../controllers/EvacuationCenterController");
const upload = require("../middlewares/uploads"); 

router.post("/", upload.single("image"), EvacuationCenterController.createEvacuationCenter);
router.get("/", EvacuationCenterController.getEvacuationCenters);
router.get("/:id", EvacuationCenterController.getEvacuationCenterById);
router.patch("/:id", upload.single("image"), EvacuationCenterController.updateEvacuationCenter);
router.patch("/status/:id", EvacuationCenterController.updateEvacuationCenterStatus);
router.delete("/:id", EvacuationCenterController.deleteEvacuationCenterById);

module.exports = router;
