const mongoose = require("mongoose");

const EvacuationCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, 
  country: { type: String, default: "Philippines" },
  region: { type: String, required: true },
  province: { type: String, required: true },
  email_address: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  phone_number: { type: String },
  city: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String },
  status: { type: String, enum: ["Open", "Closed"]},
  type: { type: String, enum: ['School', 'Gymnasium'], default: "Room", required: true},
  area_type: { type: String, enum: ['Room', 'Tent', 'Zone'], default: "Room", required: true},
  capacity: { type: Number, required: true, min: 0 },
  taken_slots: { type: Number, default: 0, min: 0 },
  staff_contact_number: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  role: { type: String, enum: ['EvacuationCenter'], default: 'EvacuationCenter' },
}, { timestamps: true }); 

async function _cascadeDelete(next) {
  const doc = this;
  try {
    await mongoose.model('EvacueeRequest').deleteMany({ evacuation_center_id: doc._id });
    await mongoose.model('EvacuationCenterOccupants').deleteMany({ evacuation_center_id: doc._id });
    await mongoose.model('EvacuationRegistration').deleteMany({ evacuation_center_id: doc._id });
    await mongoose.model('CenterArea').deleteMany({ evacuation_center_id: doc._id });
    next();
  } catch (err) {
    next(err);
  }
}

EvacuationCenterSchema.pre('remove', _cascadeDelete);
EvacuationCenterSchema.pre('deleteOne', { document: true, query: false }, _cascadeDelete); 

module.exports = mongoose.model("EvacuationCenter", EvacuationCenterSchema, "evacuation_centers");