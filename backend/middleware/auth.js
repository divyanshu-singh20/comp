const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const allowedRoles = ['Owner', 'Admin', 'ScriptWriter', 'ShootManager', 'Editor', 'Client'];
const bcryptRounds = 12;

const hashPassword = (password) => bcrypt.hash(password, bcryptRounds);
const comparePassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);

const verifyToken = async (request, response, next) => {
  try {
    const authorization = request.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || user.status !== 'Active') {
      return response.status(401).json({ message: 'Invalid or inactive user' });
    }

    request.user = user;
    return next();
  } catch (error) {
    return response.status(401).json({ message: 'Invalid or expired token' });
  }
};

const checkRole = (roles) => (request, response, next) => {
  if (!request.user || !roles.includes(request.user.role)) {
    return response.status(403).json({ message: 'You do not have permission to perform this action' });
  }

  return next();
};

module.exports = {
  allowedRoles,
  comparePassword,
  hashPassword,
  verifyToken,
  checkRole
};