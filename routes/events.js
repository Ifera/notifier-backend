const express = require('express');
const _ = require('lodash');

const router = express.Router();

const {
  validateReq,
  validateQueryParams,
  validateBulkDelete,
} = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');

const { validateQP, validatePost, validate } = require('../models/event');
const { DB_TYPE } = require('../globals');
const { BadRequest, NotFound } = require('../utils/error');
const { trim } = require('../utils');

const {
  createEvent,
  getEventByID,
  getEvents,
  updateEvent,
  deleteEvent,
  deleteEvents,
} = require(`../controllers/${DB_TYPE}/event`); // eslint-disable-line

const filteredProps = [
  'id',
  'name',
  'description',
  'is_active',
  'created_at',
  'modified_at',
  'application',
];

router.get('/', validateQueryParams(validateQP), async (req, res) => {
  const result = await getEvents(req.query);
  result.results = _.map(result.results, _.partialRight(_.pick, filteredProps));

  res.send(result);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const event = await getEventByID(req.params.id);

  if (!event) throw new NotFound('The event with the given ID was not found.');

  return res.send(_.pick(event, filteredProps));
});

router.post('/', validateReq(validatePost), async (req, res) => {
  const event = await createEvent(trim(req.body));
  return res.send(_.pick(event, filteredProps));
});

router.delete('/', validateBulkDelete, async (req, res) => {
  const result = await deleteEvents(req.body.ids);

  if (!result || result.length === 0) throw new NotFound('Nothing to delete.');

  return res.send('Success');
});

router.delete('/:id', validateObjectId, async (req, res) => {
  const result = await deleteEvent(req.params.id);

  if (!result) throw new NotFound('The event with the given ID was not found.');

  return res.send('Success');
});

router.patch(
  '/:id',
  [validateObjectId, validateReq(validate)],
  async (req, res) => {
    if (Object.keys(req.body).length === 0)
      throw new BadRequest('The request body should not be empty');

    const event = await updateEvent(req.params.id, trim(req.body));

    if (!event)
      throw new NotFound('The event with the given ID was not found.');

    return res.send(_.pick(event, filteredProps));
  },
);

module.exports = router;
