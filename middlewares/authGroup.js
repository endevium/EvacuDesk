const { verifyToken, verifyRole } = require("./auth");

const Admin = [verifyToken, verifyRole(["admin"])];
const Staff = [verifyToken, verifyRole(["staff"])];
const Evacuee = [verifyToken, verifyRole(["evacuee"])];
const AdminAndStaff = [verifyToken, verifyRole(["admin", "staff"])];
const AdminAndEvacuee = [verifyToken, verifyRole(["admin", "evacuee"])];
const AdminStaffAndEvacuee = [verifyToken, verifyRole(["admin", "staff", "evacuee"])];

module.exports = { Admin, Staff, Evacuee, AdminAndStaff, AdminAndEvacuee, AdminStaffAndEvacuee };
