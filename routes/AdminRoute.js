const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");

router.post("/login", AdminController.loginAdmin);
// router.patch("/:id", AdminController.updateAdmin);
router.patch("/password/:id", AdminController.updatePassword);

module.exports = router;