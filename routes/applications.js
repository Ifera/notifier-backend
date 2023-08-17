const express = require('express');
const _ = require('lodash');

const router = express.Router();

const { validateReq, validateQueryParams } = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { validateQP, validatePost, validate } = require('../models/application');

const {
  createApp,
  getAppByID,
  getApps,
  updateApp,
  deleteApp,
} = require('../controllers/mongodb/application');

const filteredProps = [
  'id',
  'name',
  'description',
  'is_active',
  'created_at',
  'modified_at',
];

router.get('/', validateQueryParams(validateQP), async (req, res) => {
  const result = await getApps(req.query);
  result.apps = _.map(result.apps, _.partialRight(_.pick, filteredProps));

  res.send(result);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const app = await getAppByID(req.params.id);

  if (!app)
    return res.status(404).send('The app with the given ID was not found.');

  return res.send(_.pick(app, filteredProps));
});

router.post('/', validateReq(validatePost), async (req, res, next) => {
  try {
    const app = await createApp(req.body);
    return res.send(_.pick(app, filteredProps));
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', validateObjectId, async (req, res) => {
  const result = await deleteApp(req.params.id);

  if (!result)
    return res.status(404).send('The app with the given ID was not found.');

  return res.send('Success');
});

router.patch(
  '/:id',
  [validateObjectId, validateReq(validate)],
  async (req, res) => {
    const app = await updateApp(req.params.id, req.body);

    if (!app)
      return res.status(404).send('The app with the given ID was not found.');

    return res.send(_.pick(app, filteredProps));
  },
);

module.exports = router;
