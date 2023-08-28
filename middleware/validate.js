const Joi = require('joi');
const { BadRequest } = require('../utils/error');
const { USE_MONGO_DB } = require('../globals');

module.exports.validateQueryParams = (validator) => (req, res, next) => {
  const { error } = validator(req.query);
  if (error) throw new BadRequest(error.details[0].message);
  next();
};

module.exports.validateReq = (validator) => (req, res, next) => {
  const { error } = validator(req.body);
  if (error) throw new BadRequest(error.details[0].message);
  next();
};

module.exports.validateBulkDelete = (req, res, next) => {
  const bulkDeleteSchema = Joi.object({
    ids: Joi.array()
      .items(USE_MONGO_DB ? Joi.objectId() : Joi.number().integer().positive())
      .min(1)
      .required(),
  });

  const { error } = bulkDeleteSchema.validate(req.body);
  if (error) throw new BadRequest(error.details[0].message);

  next();
};
