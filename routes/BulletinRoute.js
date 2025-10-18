const express = require("express");
const router = express.Router();
const BulletinController = require("../controllers/BulletinController");
const upload = require("../middlewares/uploads");
const { Admin, AdminAndEvacuationCenter, AllUsers } = require("../middlewares/authGroup");

router.get("/", ...AllUsers, BulletinController.getAllBulletins);
router.get("/center_name", ...AllUsers, BulletinController.getBulletinsByCenter);
router.get("/:id", ...AllUsers, BulletinController.getBulletinById);

router.post("/", ...AdminAndEvacuationCenter, upload.single("image"), BulletinController.createBulletin);
router.patch("/:id", ...AdminAndEvacuationCenter, upload.single("image"), BulletinController.updateBulletin);
router.delete("/:id", ...Admin, BulletinController.deleteBulletin);

module.exports = router;
