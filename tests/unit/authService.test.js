const bcrypt      = require('bcryptjs');
const authService = require('../../src/services/authService');
const userModel   = require('../../src/models/userModel');

describe('authService - register', () => {
  test('registers a new user and returns user without password', () => {
    const user = authService.register({
      name: 'Test User',
      email: 'test@test.com',
      password: 'secret123',
      role: 'viewer',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@test.com');
    expect(user.role).toBe('viewer');
    expect(user.password).toBeUndefined();
  });

  test('hashes the password before storing', () => {
    authService.register({
      name: 'Test User',
      email: 'test@test.com',
      password: 'secret123',
    });

    const stored = userModel.findByEmail('test@test.com');
    expect(stored.password).not.toBe('secret123');
    expect(bcrypt.compareSync('secret123', stored.password)).toBe(true);
  });

  test('throws 409 if email already exists', () => {
    authService.register({
      name: 'Test User',
      email: 'test@test.com',
      password: 'secret123',
    });

    expect(() =>
      authService.register({
        name: 'Another User',
        email: 'test@test.com',
        password: 'secret123',
      })
    ).toThrow(expect.objectContaining({ statusCode: 409 }));
  });
});

describe('authService - login', () => {
  beforeEach(() => {
    authService.register({
      name: 'Test User',
      email: 'test@test.com',
      password: 'secret123',
      role: 'viewer',
    });
  });

  test('returns token and user on valid credentials', () => {
    const result = authService.login({
      email: 'test@test.com',
      password: 'secret123',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('test@test.com');
    expect(result.user.password).toBeUndefined();
  });

  test('throws 401 on wrong password', () => {
    expect(() =>
      authService.login({ email: 'test@test.com', password: 'wrongpassword' })
    ).toThrow(expect.objectContaining({ statusCode: 401 }));
  });

  test('throws 401 on unknown email', () => {
    expect(() =>
      authService.login({ email: 'nobody@test.com', password: 'secret123' })
    ).toThrow(expect.objectContaining({ statusCode: 401 }));
  });

  test('throws 403 if user is inactive', () => {
    const user = userModel.findByEmail('test@test.com');
    userModel.update(user.id, { is_active: 0 });

    expect(() =>
      authService.login({ email: 'test@test.com', password: 'secret123' })
    ).toThrow(expect.objectContaining({ statusCode: 403 }));
  });
});