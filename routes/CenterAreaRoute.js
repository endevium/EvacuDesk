const express = require("express");
const router = express.Router();
const CenterAreaController = require("../controllers/CenterAreaController");

router.post("/", CenterAreaController.createCenterArea);
router.get("/", CenterAreaController.getCenterAreas);
router.get("/:id", CenterAreaController.getCenterAreaById);
router.patch("/add-occupant/:id", CenterAreaController.addOccupantToArea);
router.delete('/remove-occupant/:id', CenterAreaController.removeOccupantFromArea);
router.get("/center/:id", CenterAreaController.getCenterAreasByCenterId);
router.delete("/:id", CenterAreaController.deleteCenterArea);

module.exports = router;