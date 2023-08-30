require('../../../startup/logging')();
require('../../../startup/validation')();

const { validatePost } = require('../../../models/message');

const { USE_MONGO_DB } = require('../../../globals');

describe('validatePost function', () => {
  it('should validate POST request data successfully', () => {
    const req = {
      email: 'test@example.com',
      metadata: {
        key: 'value',
      },
      notification_type: USE_MONGO_DB ? '123456789012345678901234' : 1,
    };

    const result = validatePost(req);

    expect(result.error).toBeUndefined();
  });

  it('should fail validation for invalid POST request data', () => {
    // Invalid email format
    const req = {
      email: 'invalid-email',
      metadata: {
        key: 'value',
      },
      notification_type: USE_MONGO_DB ? '123456789012345678901234' : 1,
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });

  it('should fail validation if metadata is missing', () => {
    const req = {
      email: 'test@example.com',
      // metadata is missing
      notification_type: USE_MONGO_DB ? '123456789012345678901234' : 1,
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });

  it('should fail validation for invalid notification_type', () => {
    // Invalid notification_type value (not a valid ObjectId)
    const req = {
      email: 'test@example.com',
      metadata: {
        key: 'value',
      },
      notification_type: 'invalidObjectId',
    };

    const result = validatePost(req);

    expect(result.error).toBeDefined();
  });
});
