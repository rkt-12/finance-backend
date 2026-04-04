const request = require('supertest');
const app     = require('../../src/app');

let adminToken;
let analystToken;
let viewerToken;

async function registerAndLogin(name, email, role) {
  await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'secret123', role });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'secret123' });

  return res.body.data.token;
}

beforeEach(async () => {
  adminToken   = await registerAndLogin('Admin',   'admin@test.com',   'admin');
  analystToken = await registerAndLogin('Analyst', 'analyst@test.com', 'analyst');
  viewerToken  = await registerAndLogin('Viewer',  'viewer@test.com',  'viewer');

  // Seed records
  await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 5000, type: 'income',  category: 'salary',    date: '2024-03-01' });

  await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 1000, type: 'expense', category: 'rent',      date: '2024-03-05' });

  await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 2000, type: 'income',  category: 'freelance', date: '2024-04-01' });

  await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amount: 500,  type: 'expense', category: 'groceries', date: '2024-04-10' });
});

describe('GET /api/dashboard/summary', () => {
  test('200 for admin', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test('200 for analyst', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.statusCode).toBe(200);
  });

  test('403 for viewer', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('returns correct totals', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data.total_income).toBe(7000);
    expect(res.body.data.total_expenses).toBe(1500);
    expect(res.body.data.net_balance).toBe(5500);
  });

  test('respects date filters', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?from=2024-04-01&to=2024-04-30')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data.total_income).toBe(2000);
    expect(res.body.data.total_expenses).toBe(500);
    expect(res.body.data.net_balance).toBe(1500);
  });
});

describe('GET /api/dashboard/categories', () => {
  test('returns category breakdown with correct values', async () => {
    const res = await request(app)
      .get('/api/dashboard/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    const salary = res.body.data.find(c => c.category === 'salary');
    expect(salary.income).toBe(5000);
    expect(salary.expense).toBe(0);
  });
});

describe('GET /api/dashboard/trends', () => {
  test('returns trends in chronological order', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].month).toBe('2024-03');
    expect(res.body.data[1].month).toBe('2024-04');
  });

  test('calculates correct monthly totals', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${adminToken}`);

    const march = res.body.data.find(t => t.month === '2024-03');
    expect(march.income).toBe(5000);
    expect(march.expense).toBe(1000);
    expect(march.net).toBe(4000);
  });
});