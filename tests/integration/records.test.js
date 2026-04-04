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
});

const validRecord = {
  amount: 1000,
  type: 'income',
  category: 'salary',
  date: '2024-03-01',
  notes: 'March salary',
};

describe('POST /api/records', () => {
  test('201 for admin', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validRecord);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.amount).toBe(1000);
  });

  test('403 for analyst', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(validRecord);

    expect(res.statusCode).toBe(403);
  });

  test('403 for viewer', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(validRecord);

    expect(res.statusCode).toBe(403);
  });

  test('400 on negative amount', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validRecord, amount: -500 });

    expect(res.statusCode).toBe(400);
  });

  test('400 on invalid type', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validRecord, type: 'transfer' });

    expect(res.statusCode).toBe(400);
  });

  test('400 on invalid date format', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validRecord, date: '01-03-2024' });

    expect(res.statusCode).toBe(400);
  });

  test('401 with no token', async () => {
    const res = await request(app)
      .post('/api/records')
      .send(validRecord);

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/records', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validRecord);

    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 500, type: 'expense', category: 'rent', date: '2024-03-05' });
  });

  test('200 for all roles', async () => {
    for (const token of [adminToken, analystToken, viewerToken]) {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    }
  });

  test('401 with no token', async () => {
    const res = await request(app).get('/api/records');
    expect(res.statusCode).toBe(401);
  });

  test('filters by type correctly', async () => {
    const res = await request(app)
      .get('/api/records?type=expense')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(r => r.type === 'expense')).toBe(true);
  });

  test('filters by date range correctly', async () => {
    const res = await request(app)
      .get('/api/records?from=2024-03-04&to=2024-03-10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(r => r.date >= '2024-03-04' && r.date <= '2024-03-10')).toBe(true);
  });
});

describe('DELETE /api/records/:id', () => {
  test('soft deletes — record no longer appears in list', async () => {
    const create = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validRecord);

    const id = create.body.data.id;

    await request(app)
      .delete(`/api/records/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const list = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(list.body.data.find(r => r.id === id)).toBeUndefined();
  });

  test('403 for analyst', async () => {
    const res = await request(app)
      .delete('/api/records/1')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.statusCode).toBe(403);
  });
});