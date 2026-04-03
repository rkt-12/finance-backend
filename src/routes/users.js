const express  = require('express');
const { body } = require('express-validator');
const { authenticate }  = require('../middleware/auth');
const { authorize }     = require('../middleware/authorize');
const { validate }      = require('../middleware/validate');
const userService       = require('../services/userService');
const { ROLES }         = require('../config/constants');

const router = express.Router();

// All user management routes require admin
router.use(authenticate, authorize('admin'));

const updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// GET /api/users — list all users
router.get('/', (req, res, next) => {
  try {
    const users = userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id — get single user
router.get('/:id', (req, res, next) => {
  try {
    const user = userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id — update name, email, role, status, password
router.patch('/:id', updateValidation, validate, (req, res, next) => {
  try {
    const user = userService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id — delete user
router.delete('/:id', (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    userService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;