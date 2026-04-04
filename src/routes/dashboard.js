const express = require('express');
const { query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const dashboardService = require('../services/dashboardService');

const router = express.Router();

// All dashboard routes require at least analyst
router.use(authenticate, authorize('analyst'));

const dateFilters = [
  query('from').optional().isISO8601().withMessage('from must be a valid date (YYYY-MM-DD)'),
  query('to').optional().isISO8601().withMessage('to must be a valid date (YYYY-MM-DD)'),
];

// GET /api/dashboard/summary
// Returns total income, expenses, net balance, record count
router.get('/summary', dateFilters, validate, (req, res, next) => {
  try {
    const data = dashboardService.getSummary(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/categories
// Returns income/expense breakdown per category
router.get('/categories', dateFilters, validate, (req, res, next) => {
  try {
    const data = dashboardService.getCategoryBreakdown(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/trends
// Returns monthly income/expense/net totals
router.get('/trends', dateFilters, validate, (req, res, next) => {
  try {
    const data = dashboardService.getMonthlyTrends(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/recent
// Returns most recent transactions
router.get('/recent', (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data  = dashboardService.getRecentActivity(limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;