const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/CenterAreaController");

router.post("/", RoomController.createCenterArea);
router.get("/", RoomController.getCenterAreas);
router.get("/:id", RoomController.getCenterAreaById);
router.patch("/:id/add-occupant", RoomController.addOccupantToArea);
router.patch("/:id/remove-occupant/:occupantId", RoomController.removeOccupantFromArea);
router.get("/center/:id", RoomController.getCenterAreasByCenterId);
router.delete("/:id", RoomController.deleteCenterArea);

module.exports = router;