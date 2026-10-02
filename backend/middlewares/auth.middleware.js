// backend/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

/** Verifies the Bearer token and attaches `{ id, email, role }` to req.user. */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/** Restricts a route to one or more roles. Use after `authenticate`. */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do that' });
  }
  return next();
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.requireRole = requireRole;
