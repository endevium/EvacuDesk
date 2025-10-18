const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const { Admin } = require("../middlewares/authGroup");

router.post("/login", AdminController.loginAdmin);

// router.patch("/:id", Admin, AdminController.updateAdmin);
router.patch("/password/:id", Admin, AdminController.updatePassword);

module.exports = router;




