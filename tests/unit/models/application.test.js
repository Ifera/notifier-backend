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

  it('should fail for invalid query parameters', () => {
    // Invalid pageNumber (negative value)
    const req = {
      like: 'Test',
      pageNumber: -1,
    };

    const result = validateQP(req);

    expect(result.error).toBeDefined();
  });

  it('should fail if unknown query parameters are passed', () => {
    const req = {
      unknown: 'unknown',
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

  it('should fail if name is less than 3 characters', () => {
    const req = {
      name: 'A', // Invalid name (too short)
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });

  it('should fail if name is more than 50 characters', () => {
    const req = {
      name: new Array(52).join('a'),
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });

  it('should fail if description is more than 255 characters', () => {
    const req = {
      name: 'Test App',
      description: new Array(257).join('a'),
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

  it('should fail for invalid request data', () => {
    const req = {
      name: 'A', // Invalid name (too short)
    };

    const result = validate(req);

    expect(result.error).toBeDefined();
  });

  it('should fail if unknown properties are passed', () => {
    const req = {
      name: 'Test App',
      description: 'This is a test application',
      is_active: true,
      unknown: 'unknown',
    };

    const result = validate(req);

    expect(result.error).toBeDefined();
  });
});
