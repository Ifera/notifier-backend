const {
  validateQP,
  validatePost,
  validate,
} = require('../../../models/application');

describe('validateQP function', () => {
  it('should validate query parameters successfully', () => {
    const req = {
      like: 'Test',
      pageNumber: 1,
      pageSize: 10,
      isActive: true,
      sortOrder: 1,
      sortBy: 'name',
    };

    const result = validateQP(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid query parameters', () => {
    // Invalid pageNumber (negative value)
    const req = {
      like: 'Test',
      pageNumber: -1,
    };

    const result = validateQP(req);

    expect(result.error).toBeDefined();
  });
});

describe('validatePost function', () => {
  it('should validate POST request data successfully', () => {
    const req = {
      name: 'Test App',
      description: 'This is a test application',
      is_active: true,
    };

    const result = validatePost(req);

    expect(result.value).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid POST request data', () => {
    const req = {
      name: 'A', // Invalid name (too short)
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });
});

describe('validate function', () => {
  it('should validate request data successfully', () => {
    const req = {
      name: 'Test App',
      description: 'This is a test application',
      is_active: true,
    };

    const result = validate(req);

    expect(result).toEqual({
      value: req,
    });
  });

  it('should fail validation for invalid request data', () => {
    const req = {
      name: 'A', // Invalid name (too short)
    };

    const result = validate(req);

    expect(result.error).toBeDefined();
  });
});
