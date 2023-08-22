const mongoose = require('mongoose');
const Joi = require('joi');
const { USE_MONGO_DB } = require('../globals');

const messageSchema = new mongoose.Schema({
  subject: {
    type: String,
    minlength: 5,
    required: true,
  },
  body: {
    type: String,
    minlength: 5,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  is_pending: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  delivered_at: {
    type: Date,
    default: null,
  },
  notification_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationType',
    required: true,
  },
});

const Message = mongoose.model('Message', messageSchema);

function validatePost(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    metadata: Joi.object().required(),
    notification_type: USE_MONGO_DB
      ? Joi.objectId().required()
      : Joi.number().integer().positive().required(),
  });

  return schema.validate(req);
}

module.exports = {
  Message,
  validatePost,
};
