const mongoose = require('mongoose');
const Joi = require('joi');
const { qpSchema } = require('../utils/params');

const eventSchema = new mongoose.Schema({
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
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
});

const Event = mongoose.model('Event', eventSchema);

function validateQP(req) {
  const _schema = qpSchema.keys({
    application: Joi.objectId().required(),
  });

  return _schema.validate(req);
}

const schema = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().max(255),
  is_active: Joi.boolean(),
  is_deleted: Joi.boolean(),
  application: Joi.objectId(),
});

function validatePost(req) {
  const _schema = schema.keys({
    name: Joi.string().min(3).max(50).required(),
    application: Joi.objectId().required(),
  });

  return _schema.validate(req);
}

function validate(req) {
  return schema.validate(req);
}

module.exports = {
  Event,
  validateQP,
  validatePost,
  validate,
};
