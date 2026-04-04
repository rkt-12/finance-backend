const { authorize } = require('../../src/middleware/authorize');

function mockReqRes(role) {
  const req  = { user: role ? { role } : undefined };
  const res  = {};
  const next = jest.fn();
  return { req, res, next };
}

describe('authorize middleware', () => {
  test('calls next() when user role meets minimum requirement', () => {
    const { req, res, next } = mockReqRes('admin');
    authorize('analyst')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('calls next() when user role exactly matches minimum', () => {
    const { req, res, next } = mockReqRes('analyst');
    authorize('analyst')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('calls next with 403 error when role is below minimum', () => {
    const { req, res, next } = mockReqRes('viewer');
    authorize('analyst')(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 })
    );
  });

  test('calls next with 401 when no user is on request', () => {
    const { req, res, next } = mockReqRes(null);
    authorize('viewer')(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  test('admin passes analyst level check', () => {
    const { req, res, next } = mockReqRes('admin');
    authorize('analyst')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('viewer fails admin level check', () => {
    const { req, res, next } = mockReqRes('viewer');
    authorize('admin')(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 })
    );
  });
});