const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SessionLog = require('../models/SessionLog');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'Token is not valid' });
    if (!user.isActive) return res.status(401).json({ message: 'Account is deactivated' });

    // Check session log: token must be active
    const session = await SessionLog.findOne({ userId: user._id, token, active: true });
    if (!session) return res.status(401).json({ message: 'Session is expired or logged out' });

    // Attach user and session info
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Token is not valid' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token has expired' });

    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = auth;
