const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
