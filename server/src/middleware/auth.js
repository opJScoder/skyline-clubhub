const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config');

async function authenticate(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const { userId } = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
}

// Optional auth: sets req.user if the token is valid, never fails
async function softAuth(req, _res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try { req.user = await User.findById(jwt.verify(h.slice(7), env.JWT_SECRET).userId); } catch {}
  }
  next();
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Forbidden' });

const volunteerPlus = requireRole('volunteer', 'treasurer', 'admin');

module.exports = { authenticate, softAuth, requireRole, volunteerPlus };
