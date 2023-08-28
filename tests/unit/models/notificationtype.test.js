require('../../../startup/logging')();
require('../../../startup/validation')();

const {
  validateQP,
  validatePost,
  validate,
  extractTags,
} = require('../../../models/notificationtype');

describe('validateQP function', () => {
  it('should validate query parameters successfully', () => {
    const req = {
      like: 'Test',
      pageNumber: 1,
      pageSize: 10,
      isActive: true,
      sortOrder: 1,
      sortBy: 'name',
      event: '123456789012345678901234', // A valid MongoDB ObjectId
    };

    const result = validateQP(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid query parameters', () => {
    // Invalid event value (not a valid ObjectId)
    const req = {
      like: 'Test',
      pageNumber: 1,
      pageSize: 10,
      isActive: true,
      sortOrder: 1,
      sortBy: 'name',
      event: 'invalidObjectId',
    };

    const result = validateQP(req);

    expect(result.error).toBeDefined();
  });
});

describe('validatePost function', () => {
  it('should validate POST request data successfully', () => {
    const req = {
      name: 'Test NotificationType',
      description: 'This is a test notification type',
      template_subject: 'Subject',
      template_body: 'Template Body',
      is_active: true,
      event: '123456789012345678901234', // A valid MongoDB ObjectId
    };

    const result = validatePost(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid POST request data', () => {
    // Invalid event value (not a valid ObjectId)
    const req = {
      name: 'Test NotificationType',
      description: 'This is a test notification type',
      template_subject: 'Subject',
      template_body: 'Body',
      is_active: true,
      event: 'invalidObjectId',
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });
});

describe('validate function', () => {
  it('should validate request data successfully', () => {
    const req = {
      name: 'Test NotificationType',
      description: 'This is a test notification type',
      template_subject: 'Subject',
      template_body: 'Template Body',
      is_active: true,
    };

    const result = validate(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid request data', () => {
    // Invalid name value (too short)
    const req = {
      name: 'A',
      description: 'This is a test notification type',
      template_subject: 'Subject',
      template_body: 'Body',
      is_active: true,
    };

    const result = validate(req);

    expect(result.error).toBeDefined();
  });
});

describe('extractTags function', () => {
  it('should extract tags from a string', () => {
    const str = 'Hello {{name}}, your {{event}} is happening soon.';
    const tags = extractTags(str);

    expect(tags).toEqual(['name', 'event']);
  });

  it('should return an empty array for a string without tags', () => {
    const str = 'Hello, this is a plain text message.';
    const tags = extractTags(str);

    expect(tags).toEqual([]);
  });
});
