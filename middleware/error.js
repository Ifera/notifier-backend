const winston = require('winston');
const { StatusCodes } = require('http-status-codes');
const { CustomError } = require('../utils/error');

module.exports = function (err, req, res, next) {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(err.message);
  }

  if (err.detail) {
    return res.status(400).send(err.detail);
  }

  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue).join(', ');
    const values = Object.values(err.keyValue).join(', ');

    return res
      .status(StatusCodes.CONFLICT)
      .send(`Key (${keys})=(${values}) already exists.`);
  }

  winston.error(err);
  winston.error(err.stack);

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send('Something failed.');
};
