const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getJwtSecret, getJwtExpiresIn } = require("../config/auth");

function buildToken(userId) {
  const secret = getJwtSecret();

  return jwt.sign({ sub: userId }, secret, { expiresIn: getJwtExpiresIn() });
}

function toSafeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    isApproved: userDoc.isApproved !== false,
    isDenied: userDoc.isDenied === true,
  };
}

function getAdminEmailSet() {
  const raw = String(process.env.ADMIN_EMAILS || "");
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Email is already registered" });
    }

    const adminEmails = getAdminEmailSet();
    const isAdminRegistration = adminEmails.has(email);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: isAdminRegistration ? "admin" : "user",
      isApproved: isAdminRegistration,
      approvedAt: isAdminRegistration ? new Date() : null,
      isDenied: false,
    });

    if (isAdminRegistration) {
      const token = buildToken(user._id.toString());
      return res.status(201).json({
        success: true,
        data: {
          token,
          user: toSafeUser(user),
          adminRegistration: true,
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        user: toSafeUser(user),
        requiresApproval: true,
        message: "Registration submitted. Please wait for admin approval.",
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    if (user.isDenied) {
      return res.status(403).json({
        success: false,
        error: "Account request has been denied by admin",
      });
    }

    if (user.role !== "admin" && user.isApproved === false) {
      return res.status(403).json({
        success: false,
        error: "Account pending admin approval",
      });
    }

    const token = buildToken(user._id.toString());
    return res.json({
      success: true,
      data: {
        token,
        user: toSafeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  return res.json({ success: true, data: toSafeUser(req.user) });
};

exports.getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isApproved: false, isDenied: false })
      .select("_id name email role createdAt")
      .sort({ createdAt: 1 });

    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id name email role isApproved isDenied approvedAt approvedBy deniedAt deniedBy",
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ success: false, error: "Admin accounts are already approved" });
    }

    if (user.isApproved) {
      return res.json({
        success: true,
        data: toSafeUser(user),
        message: "User is already approved",
      });
    }

    user.isApproved = true;
    user.isDenied = false;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    user.deniedAt = null;
    user.deniedBy = null;
    await user.save();

    return res.json({
      success: true,
      data: toSafeUser(user),
      message: "User approved successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("_id name email role isApproved isDenied createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.makeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id name email role isApproved isDenied approvedAt approvedBy deniedAt deniedBy",
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role === "admin") {
      return res.json({
        success: true,
        data: toSafeUser(user),
        message: "User is already an admin",
      });
    }

    user.role = "admin";
    user.isApproved = true;
    user.isDenied = false;
    user.approvedAt = user.approvedAt || new Date();
    user.approvedBy = req.user._id;
    user.deniedAt = null;
    user.deniedBy = null;
    await user.save();

    return res.json({
      success: true,
      data: toSafeUser(user),
      message: "User promoted to admin successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.denyUserRequest = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id name email role isApproved isDenied deniedAt deniedBy",
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.role === "admin") {
      return res
        .status(400)
        .json({ success: false, error: "Admin accounts cannot be denied" });
    }

    if (user.isApproved) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Approved users cannot be denied as requests",
        });
    }

    if (user.isDenied) {
      return res.json({
        success: true,
        data: toSafeUser(user),
        message: "User request is already denied",
      });
    }

    user.isDenied = true;
    user.deniedAt = new Date();
    user.deniedBy = req.user._id;
    await user.save();

    return res.json({
      success: true,
      data: toSafeUser(user),
      message: "User request denied successfully",
    });
  } catch (err) {
    next(err);
  }
};
