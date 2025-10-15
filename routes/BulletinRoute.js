const express = require("express");
const router = express.Router();
const BulletinController = require("../controllers/BulletinController");
const upload = require("../middlewares/uploads");
const { AdminAndStaff } = require("../middlewares/authGroup");

router.get("/public", BulletinController.getPublicBulletins);
// router.get("/", BulletinController.getSpecificBulletins);
router.get("/:id", BulletinController.getBulletinById);

router.post("/", AdminAndStaff, upload.single("image"), BulletinController.createBulletin);
router.patch("/:id", AdminAndStaff, upload.single("image"), BulletinController.updateBulletin);
router.delete("/:id", AdminAndStaff, BulletinController.deleteBulletin);

module.exports = router;
