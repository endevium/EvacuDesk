const express = require("express");
const router = express.Router();
const CenterAreaController = require("../controllers/CenterAreaController");

router.post("/", CenterAreaController.createCenterArea);
router.get("/", CenterAreaController.getCenterAreas);
router.get("/:id", CenterAreaController.getCenterAreaById);
router.patch("/:id", CenterAreaController.updateCenterArea);
router.delete("/:id", CenterAreaController.deleteCenterArea);

module.exports = router;
