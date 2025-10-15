const express = require("express");
const router = express.Router();
const EvacueeController = require("../controllers/EvacueeController");
const upload = require("../middlewares/uploads");
const { Evacuee, AdminAndStaff, AdminAndEvacuee, AdminStaffAndEvacuee } = require("../middlewares/authGroup");

router.post("/signup", upload.single("id_picture"), EvacueeController.signupEvacuee);
router.post("/login", EvacueeController.loginEvacuee);

router.get("/", AdminAndStaff, EvacueeController.getEvacuees);
router.get("/:id", AdminStaffAndEvacuee, EvacueeController.getEvacueeById);
router.patch("/:id", AdminAndEvacuee, EvacueeController.updateEvacuee);
router.patch("/password/:id", Evacuee, EvacueeController.updatePassword);
router.delete("/:id", AdminAndStaff, EvacueeController.deleteEvacueeById);

module.exports = router;
