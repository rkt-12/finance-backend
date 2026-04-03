const express  = require('express');
const { body, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/authorize');
const { validate }     = require('../middleware/validate');
const recordService    = require('../services/recordService');

const router = express.Router();

// All record routes require authentication
router.use(authenticate);

const recordValidation = [
  body('amount')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category')
    .trim().notEmpty().withMessage('Category is required'),
  body('date')
    .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),
  body('notes')
    .optional().trim(),
];

const updateValidation = [
  body('amount')
    .optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type')
    .optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category')
    .optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('date')
    .optional().isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),
  body('notes')
    .optional().trim(),
];

const filterValidation = [
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('from').optional().isISO8601().withMessage('from must be a valid date (YYYY-MM-DD)'),
  query('to').optional().isISO8601().withMessage('to must be a valid date (YYYY-MM-DD)'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset must be 0 or greater'),
];

// GET /api/records — viewer, analyst, admin can all read
router.get('/', filterValidation, validate, (req, res, next) => {
  try {
    const records = recordService.getAllRecords(req.query);
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// GET /api/records/:id — viewer, analyst, admin
router.get('/:id', (req, res, next) => {
  try {
    const record = recordService.getRecordById(req.params.id);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// POST /api/records — admin only
router.post('/', authorize('admin'), recordValidation, validate, (req, res, next) => {
  try {
    const record = recordService.createRecord(req.body, req.user.id);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/records/:id — admin only
router.patch('/:id', authorize('admin'), updateValidation, validate, (req, res, next) => {
  try {
    const record = recordService.updateRecord(req.params.id, req.body);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/records/:id — admin only
router.delete('/:id', authorize('admin'), (req, res, next) => {
  try {
    recordService.deleteRecord(req.params.id);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;