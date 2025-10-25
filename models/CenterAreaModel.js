const mongoose = require("mongoose");

const CenterAreaSchema = new mongoose.Schema({ 
    area_number: { type: String, required: true },
    evacuation_center_id: { type: mongoose.Schema.Types.ObjectId, ref: "EvacuationCenter", required: true },
    evacuee_id: { type: mongoose.Schema.Types.ObjectId, required: false, ref: "EvacuationCenterOccupants", default: null },
    number_of_family_member: { type: Number, required: false, min: 1, default: null },
}, { timestamps: true });

module.exports = mongoose.model("CenterArea", CenterAreaSchema, "center_areas");
