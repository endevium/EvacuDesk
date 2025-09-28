const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/signup", userController.signupUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
