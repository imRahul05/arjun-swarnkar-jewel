const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const SessionLog = require("../models/SessionLog");
const MAX_SESSIONS = 3;
const router = express.Router();

const getClientIp = (req) => {
  // Try headers first (in case of reverse proxy)
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    // Sometimes contains multiple IPs: "client, proxy1, proxy2"
    return xForwardedFor.split(",")[0].trim();
  }

  // Fallback to connection info
  return req.socket.remoteAddress || null;
};

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Enforce max sessions
    const activeSessions = await SessionLog.find({
      userId: user._id,
      active: true,
    }).sort({ loginTime: 1 }); // oldest first
    if (activeSessions.length >= MAX_SESSIONS) {
      // remove oldest session(s)
      const removeCount = activeSessions.length - MAX_SESSIONS + 1;
      const oldest = activeSessions.slice(0, removeCount);
      await SessionLog.updateMany(
        { _id: { $in: oldest.map((s) => s._id) } },
        { $set: { active: false, logoutTime: new Date() } }
      );
    }

    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "Unknown";
    await SessionLog.create({
      userId: user._id,
      token,
      loginTime: new Date(),
      ip,
      active: true,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    await SessionLog.findOneAndUpdate(
      { userId: req.user._id, token, active: true },
      { $set: { logoutTime: new Date(), active: false } }
    );

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all active sessions
router.get("/sessions", auth, async (req, res) => {
  const sessions = await SessionLog.find({
    userId: req.user._id,
    active: true,
  });
  res.json(sessions);
});

// Logout from a specific device/session
router.post("/logout/:sessionId", auth, async (req, res) => {
  await SessionLog.findOneAndUpdate(
    { _id: req.params.sessionId, userId: req.user._id, active: true },
    { $set: { active: false, logoutTime: new Date() } }
  );
  res.json({ message: "Session terminated" });
});

module.exports = router;
