const mongoose = require('mongoose');
const validateObjectId = require('../../../middleware/validateObjectId');

// Mocking mongoose and globals
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

describe('validateObjectId middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {
        id: 'validObjectId',
      },
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next when and ObjectId is valid', () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);

    validateObjectId(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should return 404 and send "Invalid ID." when the ObjectId is invalid', () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    validateObjectId(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Invalid ID.');
  });
});
