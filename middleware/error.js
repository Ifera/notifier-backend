const winston = require('winston');
const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('../utils/error');

module.exports = function (err, req, res, next) {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(err.message);
  }

  // if (err.detail) {
  //   return res.status(StatusCodes.BAD_REQUEST).send(err.detail);
  // }

  const logger = winston.child({ traceID: req.traceID });
  logger.error(err.stack);

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send('Something failed.');
};
