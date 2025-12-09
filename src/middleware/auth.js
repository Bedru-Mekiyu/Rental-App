// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function auth(allowedRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = header.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // payload should at least contain: { id, role }
      req.user = {
        id: payload.id,
        role: payload.role,
      };

      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      console.error('auth middleware error:', err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = auth;
