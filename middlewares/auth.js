const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserTokenModel");

// verify token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(403).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(403).json({ message: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tokenExists = await UserToken.findOne({ token });
    if (!tokenExists)
      return res.status(401).json({ message: "Token expired or invalid" });

    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

// verify user role
exports.verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Insufficient privilege" });
    }
    next();
  };
};
