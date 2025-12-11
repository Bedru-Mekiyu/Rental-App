const jwt = require('jsonwebtoken');

const auth = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: no token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: payload.id,
        role: payload.role,
      };

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }

      next();
    } catch (err) {
      console.error('auth middleware error:', err.message);
      return res.status(401).json({ message: 'unauthorized: Invalid or expired token' });
    }
  };
}

module.exports = auth;
