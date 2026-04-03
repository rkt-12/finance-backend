const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { createError } = require('../middleware/errorHandler');

function getAllUsers() {
  return userModel.findAll();
}

function getUserById(id) {
  const user = userModel.findById(id);
  if (!user) throw createError('User not found', 404);
  return sanitize(user);
}

function updateUser(id, fields) {
  const user = userModel.findById(id);
  if (!user) throw createError('User not found', 404);

  // If password is being updated, hash it
  if (fields.password) {
    fields.password = bcrypt.hashSync(fields.password, 10);
  }

  const updated = userModel.update(id, fields);
  return sanitize(updated);
}

function deleteUser(id) {
  const user = userModel.findById(id);
  if (!user) throw createError('User not found', 404);
  userModel.delete(id);
}

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };