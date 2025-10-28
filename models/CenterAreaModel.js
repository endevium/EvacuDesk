const mongoose = require("mongoose");

const CenterAreaSchema = new mongoose.Schema({ 
    area_number: { type: String, required: true },
    evacuation_center_id: { type: mongoose.Schema.Types.ObjectId, ref: "EvacuationCenter", required: true },
    capacity: { type: Number, required: true, min: 1 },
    occupants: [{
        evacuee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Evacuee", required: true },
        number_of_family_members: { type: Number, required: true, min: 1 },
        date_assigned: { type: Date, default: Date.now }
    }],

}, { timestamps: true });

CenterAreaSchema.virtual('current_occupancy').get(function() {
    return this.occupants.reduce((total, occupant) => total + occupant.number_of_family_members, 0);
});

CenterAreaSchema.virtual('available_space').get(function() {
    return this.capacity - this.current_occupancy;
});

CenterAreaSchema.virtual('status').get(function() {
    return this.current_occupancy >= this.capacity ? "Full" : "Available";
});

CenterAreaSchema.set('toJSON', { virtuals: true });
CenterAreaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("CenterArea", CenterAreaSchema, "center_areas");