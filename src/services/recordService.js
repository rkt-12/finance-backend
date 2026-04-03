const recordModel = require('../models/recordModel');
const { createError } = require('../middleware/errorHandler');

function getAllRecords(filters) {
  return recordModel.findAll(filters);
}

function getRecordById(id) {
  const record = recordModel.findById(id);
  if (!record) throw createError('Record not found', 404);
  return record;
}

function createRecord(data, userId) {
  return recordModel.create({ ...data, created_by: userId });
}

function updateRecord(id, fields) {
  const record = recordModel.findById(id);
  if (!record) throw createError('Record not found', 404);
  return recordModel.update(id, fields);
}

function deleteRecord(id) {
  const record = recordModel.findById(id);
  if (!record) throw createError('Record not found', 404);
  recordModel.softDelete(id);
}

module.exports = { getAllRecords, getRecordById, createRecord, updateRecord, deleteRecord };