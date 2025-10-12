const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    phone_number: { type: String },
    sex: { type: String, enum: ['male', 'female'] },
    organization: { type: String, required: true },
    position: { type: String, required: true },
    id_picture: { type: String, required: true }, 
    authorization_letter: { type: String, required: true }, 
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    role: { type: String, enum: ['staff'], default: 'staff' }
}, { timestamps: true });

module.exports = mongoose.model("Staff", StaffSchema);
