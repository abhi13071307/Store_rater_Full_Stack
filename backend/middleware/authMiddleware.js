// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

// verifies JWT and attaches user info to req.user; rejects if missing/invalid
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authorization token required' });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// role guard: authorize('SYSTEM_ADMIN','STORE_OWNER')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    return next();
  };
}

// optionalAuth: if token present and valid -> attach req.user; if missing/invalid -> continue as anonymous
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return next(); // no token -> anonymous, continue

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    // If token invalid/expired, treat as anonymous (log and continue)
    console.warn('Optional auth: invalid token, proceeding as anonymous');
    return next();
  }
}

module.exports = { authMiddleware, authorize, optionalAuth };
