const request = require('supertest');
const app     = require('../../src/app');

describe('POST /api/auth/register', () => {
  test('201 with user data on valid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: 'secret123', role: 'viewer' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@test.com');
    expect(res.body.data.password).toBeUndefined();
  });

  test('400 on missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].field).toBe('name');
  });

  test('400 on invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: 'secret123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe('email');
  });

  test('400 on short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].field).toBe('password');
  });

  test('409 on duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test 2', email: 'test@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: 'secret123' });
  });

  test('200 with token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  test('401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(401);
  });
});