const { ROLE_HIERARCHY } = require('../config/constants');
const { createError }    = require('./errorHandler');

// authorize('analyst')  → allows analyst and admin
// authorize('admin')    → allows admin only
// authorize('viewer')   → allows all roles

function authorize(minimumRole) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(createError('Not authenticated', 401));
    }

    const userLevel    = ROLE_HIERARCHY.indexOf(userRole);
    const requiredLevel = ROLE_HIERARCHY.indexOf(minimumRole);

    if (userLevel === -1 || requiredLevel === -1) {
      return next(createError('Invalid role configuration', 500));
    }

    if (userLevel < requiredLevel) {
      return next(createError('You do not have permission to perform this action', 403));
    }

    next();
  };
}

module.exports = { authorize };