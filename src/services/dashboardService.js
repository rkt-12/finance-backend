const recordModel = require('../models/recordModel');

function getSummary(filters) {
  const records = recordModel.findAllForSummary(filters);

  let totalIncome   = 0;
  let totalExpenses = 0;

  for (const r of records) {
    if (r.type === 'income')  totalIncome   += r.amount;
    if (r.type === 'expense') totalExpenses += r.amount;
  }

  return {
    total_income:    parseFloat(totalIncome.toFixed(2)),
    total_expenses:  parseFloat(totalExpenses.toFixed(2)),
    net_balance:     parseFloat((totalIncome - totalExpenses).toFixed(2)),
    record_count:    records.length,
  };
}

function getCategoryBreakdown(filters) {
  const records = recordModel.findAllForSummary(filters);

  const breakdown = {};

  for (const r of records) {
    if (!breakdown[r.category]) {
      breakdown[r.category] = { income: 0, expense: 0, net: 0 };
    }
    breakdown[r.category][r.type]  += r.amount;
    breakdown[r.category].net      += r.type === 'income' ? r.amount : -r.amount;
  }

  // Round all values and return as array sorted by absolute net
  return Object.entries(breakdown)
    .map(([category, totals]) => ({
      category,
      income:  parseFloat(totals.income.toFixed(2)),
      expense: parseFloat(totals.expense.toFixed(2)),
      net:     parseFloat(totals.net.toFixed(2)),
    }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

function getMonthlyTrends(filters) {
  const records = recordModel.findAllForSummary(filters);

  const trends = {};

  for (const r of records) {
    // Extract YYYY-MM from date
    const month = r.date.slice(0, 7);

    if (!trends[month]) {
      trends[month] = { month, income: 0, expense: 0, net: 0 };
    }

    trends[month][r.type]  += r.amount;
    trends[month].net      += r.type === 'income' ? r.amount : -r.amount;
  }

  // Sort chronologically and round values
  return Object.values(trends)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(t => ({
      month:   t.month,
      income:  parseFloat(t.income.toFixed(2)),
      expense: parseFloat(t.expense.toFixed(2)),
      net:     parseFloat(t.net.toFixed(2)),
    }));
}

function getRecentActivity(limit = 5) {
  const records = recordModel.findAll({ limit, offset: 0 });
  return records;
}

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity };