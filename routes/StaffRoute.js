const express = require("express");
const router = express.Router();
const StaffController = require("../controllers/StaffController");
const upload = require("../middlewares/uploads");

router.post("/signup", upload.fields([
    { name: "id_picture", maxCount: 1 },
    { name: "authorization_letter", maxCount: 1 }
]), StaffController.signupStaff);
router.post("/login", StaffController.loginStaff);
router.get("/", StaffController.getStaffs);
router.get("/:id", StaffController.getStaffById);
router.patch("/:id", StaffController.updateStaff);
router.patch("/password/:id", StaffController.updatePassword);
router.patch("/status/:id", StaffController.updateStaffStatus);
router.delete("/:id", StaffController.deleteStaffById);

module.exports = router;
