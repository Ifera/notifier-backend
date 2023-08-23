const express = require('express');
const _ = require('lodash');

const router = express.Router();

const {
  validateReq,
  validateQueryParams,
  validateBulkDelete,
} = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');

const {
  validateQP,
  validatePost,
  validate,
  extractTags,
} = require('../models/notificationtype');
const { DB_TYPE } = require('../globals');

const {
  createNotificationType,
  getNotificationTypeByID,
  getNotificationTypes,
  updateNotificationType,
  deleteNotificationType,
  deleteNotificationTypes,
} = require(`../controllers/${DB_TYPE}/notificationtype`); // eslint-disable-line

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

router.post('/', validateReq(validatePost), async (req, res) => {
  // extract tags from the body and set it with the request body
  req.body.tags = extractTags(req.body.template_body);
  const event = await createNotificationType(req.body);

  return res.send(_.pick(event, filteredProps));
});

router.delete('/', validateBulkDelete, async (req, res) => {
  const result = await deleteNotificationTypes(req.body.ids);

  if (result.length === 0) return res.status(404).send('Nothing to delete.');

  return res.send('Success');
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
    if (Object.keys(req.body).length === 0)
      return res.status(400).send('request body should not be empty');

    // extract tags from the body and set it with the request body
    if (req.body.template_body) {
      req.body.tags = extractTags(req.body.template_body);
    }

    const event = await updateNotificationType(req.params.id, req.body);

    if (!event)
      return res
        .status(404)
        .send('The notification type with the given ID was not found.');

    return res.send(_.pick(event, filteredProps));
  },
);

module.exports = router;
