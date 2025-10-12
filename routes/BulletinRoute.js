const express = require("express");
const router = express.Router();
const BulletinController = require("../controllers/BulletinController");
const upload = require("../middlewares/uploads");

router.post("/", upload.single("image"), BulletinController.createBulletin);
router.get("/public", BulletinController.getPublicBulletins);
// router.get("/", BulletinController.getSpecificBulletins);
router.get("/:id", BulletinController.getBulletinById);
router.patch("/:id", upload.single("image"), BulletinController.updateBulletin);
router.delete("/:id", BulletinController.deleteBulletin);

module.exports = router;
