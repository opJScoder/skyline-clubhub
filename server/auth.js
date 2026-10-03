const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLE_VALUES } = require('../config/constants');

/**
 * Validates the Bearer JWT, loads the user fresh from the database (so role and
 * membership changes take effect immediately) and attaches it to req.user.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    throw new AppError(401, err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError(401, 'Account no longer exists');

  req.user = user;
  next();
});

/**
 * Strict RBAC. The user's role must be explicitly listed; there is no implicit
 * "admin can do everything". Usage: requireRole('treasurer', 'admin') or requireRole(['admin']).
 * Must run after authenticate.
 */
function requireRole(...roles) {
  const allowed = roles.flat();

  if (allowed.length === 0 || !allowed.every((r) => ROLE_VALUES.includes(r))) {
    throw new Error(`requireRole called with invalid roles: ${JSON.stringify(allowed)}`);
  }

  return (req, _res, next) => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (!allowed.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to do that'));
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
