const mongoose = require('mongoose');
const Joi = require('joi');
const { qpSchema } = require('../utils/params');
const { USE_MONGO_DB } = require('../globals');

const ntSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    // unique: true,
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

// ntSchema.index({ name: 1, event: 1 }, { unique: true });

const NotificationType = mongoose.model('NotificationType', ntSchema);

function validateQP(req) {
  const _schema = qpSchema.keys({
    event: USE_MONGO_DB
      ? Joi.objectId().required()
      : Joi.number().integer().positive().required(),
  });

  return _schema.validate(req);
}

const schema = Joi.object({
  name: Joi.string().min(3).max(50),
  description: Joi.string().max(255),
  template_subject: Joi.string().min(5),
  template_body: Joi.string().min(5),
  is_active: Joi.boolean(),
  is_deleted: Joi.boolean(),
});

function validatePost(req) {
  const _schema = schema.keys({
    name: Joi.string().min(3).max(50).required(),
    template_subject: Joi.string().min(5).required(),
    template_body: Joi.string().min(5).required(),
    event: USE_MONGO_DB
      ? Joi.objectId().required()
      : Joi.number().integer().positive().required(),
  });

  return _schema.validate(req);
}

// used for patch/put req
function validate(req) {
  return schema.validate(req);
}

function extractTags(str) {
  const tagPattern = /{(.*?)}/g;
  const tags = [];
  let match;

  // eslint-disable-next-line
  while ((match = tagPattern.exec(str)) !== null) {
    tags.push(match[1]);
  }

  return tags;
}

module.exports = {
  NotificationType,
  validateQP,
  validatePost,
  validate,
  extractTags,
};
