const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { validateReq } = require('../middleware/validate');
const { validatePost } = require('../models/message');
const { createMessage } = require('../controllers/mongodb/message');

const filteredProps = [
  'id',
  'subject',
  'body',
  'email',
  'is_pending',
  'notification_type',
  'created_at',
  'delivered_at',
];

router.post('/', validateReq(validatePost), async (req, res, next) => {
  try {
    const message = await createMessage(req.body);
    return res.send(_.pick(message, filteredProps));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
