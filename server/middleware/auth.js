const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getJwtSecret } = require("../config/auth");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Authorization token is required" });
    }

    const secret = getJwtSecret();

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.sub).select(
      "_id name email role isApproved isDenied",
    );

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    if (user.role !== "admin" && user.isApproved === false) {
      return res
        .status(403)
        .json({ success: false, error: "Account pending admin approval" });
    }

    if (user.isDenied) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Account request has been denied by admin",
        });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, error: "Admin access required" });
  }

  return next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
};
