const traceID = require('../../../middleware/traceId');

describe('middleware: traceId', () => {
  it('should generate a new traceId if not present', async () => {
    const req = { header: () => null };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    traceID(req, res, next);

    expect(res.setHeader).toHaveBeenCalled();
    expect(req.traceID).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it('should use the existing traceId if present', async () => {
    const req = { header: () => '1234' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    traceID(req, res, next);

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(req.traceID).toBe('1234');
    expect(next).toHaveBeenCalled();
  });
});
