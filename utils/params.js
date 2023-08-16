const Joi = require('joi');

const qpSchema = Joi.object({
  like: Joi.string().min(1).max(50),
  pageNumber: Joi.number().min(0),
  pageSize: Joi.number().min(1),
  isActive: Joi.boolean(),
  sortOrder: Joi.number().valid(1, -1),
  sortBy: Joi.string().valid('name', 'created_at', 'modified_at', 'is_active'),
});

module.exports = {
  qpSchema,
};
