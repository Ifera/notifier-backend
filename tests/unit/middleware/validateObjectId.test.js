const { StatusCodes } = require('http-status-codes');
const validateObjectId = require('../../../middleware/validateObjectId');
const { USE_MONGO_DB } = require('../../../globals');

describe('validateObjectId middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {
        id: USE_MONGO_DB ? '123456789012345678901234' : 1,
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

  it('should call next when ObjectId is valid', () => {
    validateObjectId(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('should return 404 and send "Invalid ID." when the ObjectId is invalid', () => {
    req.params.id = 'invalidId';

    validateObjectId(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(res.send).toHaveBeenCalledWith('Invalid ID.');
  });
});
