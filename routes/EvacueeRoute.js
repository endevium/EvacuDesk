const express = require("express");
const router = express.Router();
const EvacueeController = require("../controllers/EvacueeController");
const upload = require("../utils/uploads");
const { Evacuee, AdminAndEvacuationCenter, AdminAndEvacuee, AllUsers } = require("../middlewares/authGroup");

router.post("/signup", upload.fields([
    { name: "id_picture", maxCount: 1 },
    { name: "profile_picture", maxCount: 1 }]), 
    EvacueeController.signupEvacuee);
router.post("/login", EvacueeController.loginEvacuee);
router.post("/existing-email", EvacueeController.getExistingEmail);
router.get("/", ...AdminAndEvacuationCenter, EvacueeController.getEvacuees);
router.get("/:id", ...AllUsers, EvacueeController.getEvacueeById);
router.patch("/:id", ...AdminAndEvacuee, upload.single("profile_picture"), EvacueeController.updateEvacuee);
router.patch("/password/:id", ...Evacuee, EvacueeController.updatePassword);
router.delete("/:id", ...AdminAndEvacuee, EvacueeController.deleteEvacueeById);
router.get("/recommended-center/:id", ...Evacuee, EvacueeController.getCenterRecommendation)

module.exports = router;
