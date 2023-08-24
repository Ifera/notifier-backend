/* eslint-disable max-classes-per-file */

const { StatusCodes } = require('http-status-codes');

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class BadRequest extends CustomError {
  constructor(message) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

class NotFound extends CustomError {
  constructor(message) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

class ConflictError extends CustomError {
  constructor(message) {
    super(message, StatusCodes.CONFLICT);
  }
}

module.exports = {
  CustomError,
  BadRequest,
  NotFound,
  ConflictError,
};
