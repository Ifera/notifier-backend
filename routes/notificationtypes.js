const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { validateReq, validateQueryParams } = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const {
  validateQP,
  validatePost,
  validate,
} = require('../models/notificationtype');

const {
  createNotificationType,
  getNotificationTypeByID,
  getNotificationTypes,
  updateNotificationType,
  deleteNotificationType,
} = require('../controllers/mongodb/notificationtype');

const filteredProps = [
  'id',
  'name',
  'description',
  'template_subject',
  'template_body',
  'tags',
  'is_active',
  'created_at',
  'modified_at',
  'event',
];

router.get('/', validateQueryParams(validateQP), async (req, res) => {
  const result = await getNotificationTypes(req.query);
  result.notification_types = _.map(
    result.notification_types,
    _.partialRight(_.pick, filteredProps),
  );

  res.send(result);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const nt = await getNotificationTypeByID(req.params.id);

  if (!nt)
    return res
      .status(404)
      .send('The notification type with the given ID was not found.');

  return res.send(_.pick(nt, filteredProps));
});

router.post('/', validateReq(validatePost), async (req, res, next) => {
  try {
    const event = await createNotificationType(req.body);
    return res.send(_.pick(event, filteredProps));
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', validateObjectId, async (req, res) => {
  const result = await deleteNotificationType(req.params.id);

  if (!result)
    return res
      .status(404)
      .send('The notification type with the given ID was not found.');

  return res.send('Success');
});

router.patch(
  '/:id',
  [validateObjectId, validateReq(validate)],
  async (req, res) => {
    const event = await updateNotificationType(req.params.id, req.body);

    if (!event)
      return res
        .status(404)
        .send('The notification type with the given ID was not found.');

    return res.send(_.pick(event, filteredProps));
  },
);

module.exports = router;
