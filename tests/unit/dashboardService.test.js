const dashboardService = require('../../src/services/dashboardService');
const authService      = require('../../src/services/authService');
const recordModel      = require('../../src/models/recordModel');

let userId;

beforeEach(() => {
  const user = authService.register({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'secret123',
    role: 'admin',
  });
  userId = user.id;

  // Seed records
  recordModel.create({ amount: 5000, type: 'income',  category: 'salary',    date: '2024-03-01', created_by: userId });
  recordModel.create({ amount: 1000, type: 'expense', category: 'rent',      date: '2024-03-05', created_by: userId });
  recordModel.create({ amount: 2000, type: 'income',  category: 'freelance', date: '2024-04-01', created_by: userId });
  recordModel.create({ amount: 500,  type: 'expense', category: 'groceries', date: '2024-04-10', created_by: userId });
});

describe('dashboardService - getSummary', () => {
  test('calculates total income correctly', () => {
    const summary = dashboardService.getSummary({});
    expect(summary.total_income).toBe(7000);
  });

  test('calculates total expenses correctly', () => {
    const summary = dashboardService.getSummary({});
    expect(summary.total_expenses).toBe(1500);
  });

  test('calculates net balance correctly', () => {
    const summary = dashboardService.getSummary({});
    expect(summary.net_balance).toBe(5500);
  });

  test('respects date filters', () => {
    const summary = dashboardService.getSummary({ from: '2024-04-01', to: '2024-04-30' });
    expect(summary.total_income).toBe(2000);
    expect(summary.total_expenses).toBe(500);
  });
});

describe('dashboardService - getCategoryBreakdown', () => {
  test('groups records by category correctly', () => {
    const breakdown = dashboardService.getCategoryBreakdown({});
    const categories = breakdown.map(b => b.category);
    expect(categories).toContain('salary');
    expect(categories).toContain('rent');
    expect(categories).toContain('freelance');
    expect(categories).toContain('groceries');
  });

  test('calculates correct income per category', () => {
    const breakdown = dashboardService.getCategoryBreakdown({});
    const salary = breakdown.find(b => b.category === 'salary');
    expect(salary.income).toBe(5000);
    expect(salary.expense).toBe(0);
  });
});

describe('dashboardService - getMonthlyTrends', () => {
  test('returns results in chronological order', () => {
    const trends = dashboardService.getMonthlyTrends({});
    expect(trends[0].month).toBe('2024-03');
    expect(trends[1].month).toBe('2024-04');
  });

  test('calculates correct totals per month', () => {
    const trends = dashboardService.getMonthlyTrends({});
    const march = trends.find(t => t.month === '2024-03');
    expect(march.income).toBe(5000);
    expect(march.expense).toBe(1000);
    expect(march.net).toBe(4000);
  });
});