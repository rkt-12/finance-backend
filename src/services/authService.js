const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { createError } = require('../middleware/errorHandler');

function register({ name, email, password, role }) {
  const existing = userModel.findByEmail(email);
  if (existing) throw createError('Email already in use', 409);

  const hashed = bcrypt.hashSync(password, 10);
  const user   = userModel.create({ name, email, password: hashed, role });

  return sanitize(user);
}

function login({ email, password }) {
  const user = userModel.findByEmail(email);
  if (!user) throw createError('Invalid email or password', 401);

  if (!user.is_active) throw createError('Account is inactive', 403);

  const match = bcrypt.compareSync(password, user.password);
  if (!match) throw createError('Invalid email or password', 401);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { token, user: sanitize(user) };
}

// Never return password to client
function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

module.exports = { register, login };