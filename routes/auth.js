const express = require('express');
const _ = require('lodash');

const { DB_TYPE } = require('../globals');
const { trim } = require('../utils');

const { login, createUser } = require(`../controllers/${DB_TYPE}/auth`); // eslint-disable-line

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await login(trim(req.body));
  res.send(result);
});

router.post('/register', async (req, res) => {
  const result = await createUser(trim(req.body));

  res.send(result);
});

module.exports = router;
