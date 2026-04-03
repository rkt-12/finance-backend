const jwt = require('jsonwebtoken');
const { createError } = require('./errorHandler');
const userModel = require('../models/userModel');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch fresh user from DB so revoked/inactive users are blocked
    const user = userModel.findById(decoded.id);

    if (!user) {
      return next(createError('User no longer exists', 401));
    }
    if (!user.is_active) {
      return next(createError('Account is inactive', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(createError('Invalid or expired token', 401));
  }
}

module.exports = { authenticate };