const mongoose = require('mongoose');
const Joi = require('joi');
const { qpSchema } = require('../utils/params');

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  description: {
    type: String,
    default: '',
    maxlength: 255,
  },
  is_active: {
    type: Boolean,
    default: false,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  modified_at: {
    type: Date,
    default: Date.now,
  },
});

const Application = mongoose.model('Application', applicationSchema);

const schema = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().max(255),
  is_active: Joi.boolean(),
  is_deleted: Joi.boolean(),
});

function validateQP(req) {
  return qpSchema.validate(req);
}

function validatePost(req) {
  const _schema = schema.keys({
    name: Joi.string().min(3).max(50).required(),
  });

  return _schema.validate(req);
}

function validate(req) {
  return schema.validate(req);
}

module.exports = {
  Application,
  validateQP,
  validatePost,
  validate,
};
