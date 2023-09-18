const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { validateReq } = require('../middleware/validate');
const { validatePost } = require('../models/message');
const { DB_TYPE } = require('../globals');

const { createMessage } = require(`../controllers/${DB_TYPE}/message`); // eslint-disable-line

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

router.post('/', validateReq(validatePost), async (req, res) => {
  const message = await createMessage(req.body);
  return res.send(_.pick(message, filteredProps));
});

module.exports = router;
