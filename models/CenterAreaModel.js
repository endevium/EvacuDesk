const mongoose = require("mongoose");

const CenterAreaSchema = new mongoose.Schema({ 
    area_type: { type: String, enum: ["Tent", "Room", "Zone"] },
    area_name: { type: String, required: true },
    evacuation_center_id: { type: mongoose.Schema.Types.ObjectId, ref: "EvacuationCenter", required: true },
    capacity: { type: Number, min: 5 },
    size: { type: String, enum: ["Small", "Medium", "Large"] },
    status: { type: String, enum: ["Occupied", "Unoccupied"], default: "Unoccupied" },
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

CenterAreaSchema.set('toJSON', { virtuals: true });
CenterAreaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("CenterArea", CenterAreaSchema, "center_areas");
