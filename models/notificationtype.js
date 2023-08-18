const mongoose = require('mongoose');
const Joi = require('joi');
const { qpSchema } = require('../utils/params');

const ntSchema = new mongoose.Schema({
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
  template_subject: {
    type: String,
    minlength: 5,
    required: true,
  },
  template_body: {
    type: String,
    minlength: 5,
    required: true,
  },
  tags: {
    type: Array,
    default: [],
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
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
});

const NotificationType = mongoose.model('NotificationType', ntSchema);

function validateQP(req) {
  const _schema = qpSchema.keys({
    event: Joi.objectId().required(),
  });

  return _schema.validate(req);
}

const schema = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().max(255),
  template_subject: Joi.string().min(5),
  template_body: Joi.string().min(5),
  tags: Joi.array().items(Joi.string().min(3)),
  is_active: Joi.boolean(),
  is_deleted: Joi.boolean(),
  event: Joi.objectId(),
});

function validatePost(req) {
  const _schema = schema.keys({
    name: Joi.string().min(3).max(50).required(),
    template_subject: Joi.string().min(5).required(),
    template_body: Joi.string().min(5).required(),
    event: Joi.objectId().required(),
  });

  return _schema.validate(req);
}

// used for patch/put req
function validate(req) {
  return schema.validate(req);
}

module.exports = {
  NotificationType,
  validateQP,
  validatePost,
  validate,
};
