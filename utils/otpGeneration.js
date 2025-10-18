const UserOTP = require("../models/UserOTPModel");

exports.generateOTP = async (user_id, role) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await UserOTP.deleteMany({ user_id, role });

  await UserOTP.create({
    user_id,
    role,
    code: otp,
    expiresAt,
  });

  return otp;
};
