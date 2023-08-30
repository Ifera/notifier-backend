const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi); // for tests

const { StatusCodes } = require('http-status-codes');
const { USE_MONGO_DB } = require('../globals');

const schema = USE_MONGO_DB
  ? Joi.objectId().required()
  : Joi.number().integer().positive().required();

// eslint-disable-next-line consistent-return
module.exports = function (req, res, next) {
  if (schema.validate(req.params.id).error) {
    return res.status(StatusCodes.NOT_FOUND).send('Invalid ID.');
  }

  next();
};
