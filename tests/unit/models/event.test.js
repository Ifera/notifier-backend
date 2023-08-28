require('../../../startup/logging')();
require('../../../startup/validation')();

const { validateQP, validatePost, validate } = require('../../../models/event');

describe('validateQP function', () => {
  it('should validate query parameters successfully', () => {
    const req = {
      like: 'Test',
      pageNumber: 1,
      pageSize: 10,
      isActive: true,
      sortOrder: 1,
      sortBy: 'name',
      application: '123456789012345678901234', // A valid MongoDB ObjectId
    };

    const result = validateQP(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid query parameters', () => {
    // Invalid application value (not a valid ObjectId)
    const req = {
      like: 'Test',
      pageNumber: 1,
      pageSize: 10,
      isActive: true,
      sortOrder: 1,
      sortBy: 'name',
      application: 'invalidObjectId',
    };

    const result = validateQP(req);

    expect(result.error).toBeDefined();
  });
});

describe('validatePost function', () => {
  it('should validate POST request data successfully', () => {
    const req = {
      name: 'Test Event',
      description: 'This is a test event',
      is_active: true,
      application: '123456789012345678901234', // A valid MongoDB ObjectId
    };

    const result = validatePost(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid POST request data', () => {
    // Invalid application value (not a valid ObjectId)
    const req = {
      name: 'Test Event',
      description: 'This is a test event',
      is_active: true,
      application: 'invalidObjectId',
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });
});

describe('validate function', () => {
  it('should validate request data successfully', () => {
    const req = {
      name: 'Test Event',
      description: 'This is a test event',
      is_active: true,
    };

    const result = validate(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid request data', () => {
    // Invalid name value (too short)
    const req = {
      name: 'A',
      description: 'This is a test event',
      is_active: true,
    };

    const result = validate(req);

    expect(result.error).toBeDefined();
  });
});
