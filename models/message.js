const mongoose = require('mongoose');
const Joi = require('joi');

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
    notification_type: Joi.objectId().required(),
    email: Joi.string().email().required(),
    metadata: Joi.object().required(),
  });

  return schema.validate(req);
}

module.exports = {
  Message,
  validatePost,
};
