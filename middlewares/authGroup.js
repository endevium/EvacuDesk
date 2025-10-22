const { verifyToken, verifyRole } = require("./auth");

const Admin = [verifyToken, verifyRole(["Admin"])];
const EvacuationCenter = [verifyToken, verifyRole(["EvacuationCenter"])];
const Evacuee = [verifyToken, verifyRole(["Evacuee"])];
const AdminAndEvacuationCenter = [verifyToken, verifyRole(["Admin", "EvacuationCenter"])];
const AdminAndEvacuee = [verifyToken, verifyRole(["Admin", "Evacuee"])];
const AllUsers = [verifyToken, verifyRole(["Admin", "EvacuationCenter", "Evacuee"])];

module.exports = { Admin, EvacuationCenter, Evacuee, AdminAndEvacuationCenter, AdminAndEvacuee, AllUsers };
