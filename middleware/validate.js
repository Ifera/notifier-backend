const Joi = require('joi');
const { USE_MONGO_DB } = require('../globals');

// eslint-disable-next-line consistent-return
module.exports.validateQueryParams = (validator) => (req, res, next) => {
  const { error } = validator(req.query);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};

// eslint-disable-next-line consistent-return
module.exports.validateReq = (validator) => (req, res, next) => {
  const { error } = validator(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};

// eslint-disable-next-line consistent-return
module.exports.validateBulkDelete = (req, res, next) => {
  const bulkDeleteSchema = Joi.object({
    ids: Joi.array()
      .items(USE_MONGO_DB ? Joi.objectId() : Joi.number().integer().positive())
      .min(1)
      .required(),
  });

  const { error } = bulkDeleteSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  next();
};
