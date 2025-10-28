const mongoose = require("mongoose");

const EvacueeSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    is_verified: { type: Boolean, default: false },
    password: { type: String, required: true },
    street_number: { type: String, required: true },
    barangay: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, default: "Philippines" },
    phone_number: { type: String },
    sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    birthdate: { type: Date, required: true },
    disabilities: { type: String },
    id_picture: { type: String, required: true },
    role: { type: String, enum: ['Evacuee'], default: 'Evacuee' },
    // auto delete unverified gmail 
//     expiresAt: { 
//         type: Date, 
//         default: function() {
//             return this.is_verified ? null : new Date(Date.now() + 60 * 5000); 
//         }
//     }
// }, { timestamps: true });

// EvacueeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// EvacueeSchema.pre('save', function(next) {
//     if (this.isModified('is_verified')) {
//         this.expiresAt = this.is_verified ? null : new Date(Date.now() + 60 * 1000);
//     }
//     next();
});

async function _cascadeDelete(next) {
    const doc = this;
    try {
        await mongoose.model('EvacueeRequest').deleteMany({ evacuee_id: doc._id });
        await mongoose.model('EvacuationRegistration').deleteMany({ evacuee_id: doc._id });
        await mongoose.model('EvacuationCenterOccupants').deleteMany({ evacuee_id: doc._id });
        next();
    } catch (err) {
        console.error("Error in cascade delete:", err);
        next(err);
    }
}
EvacueeSchema.pre('remove', _cascadeDelete);
EvacueeSchema.pre('deleteOne', { document: true, query: false }, _cascadeDelete);

module.exports = mongoose.model("Evacuee", EvacueeSchema);