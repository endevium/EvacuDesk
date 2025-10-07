const express = require("express");
const router = express.Router();
const EvacueeController = require("../controllers/EvacueeController");
const upload = require("../middlewares/uploads");

router.post("/signup", upload.single("id_picture"), EvacueeController.signupEvacuee);
router.post("/login", EvacueeController.loginEvacuee);
router.get("/", EvacueeController.getEvacuees);
router.get("/:id", EvacueeController.getEvacueeById);
router.patch("/:id", EvacueeController.updateEvacuee);
router.patch("/password/:id", EvacueeController.updatePassword);
router.delete("/:id", EvacueeController.deleteEvacueeById);

module.exports = router;
