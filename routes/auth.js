const express = require('express');

const { DB_TYPE } = require('../globals');

const { login, createUser } = require(`../controllers/${DB_TYPE}/auth`); // eslint-disable-line

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await login(req.body);
  res.send(result);
});

router.post('/register', async (req, res) => {
  const result = await createUser(req.body);

  res.send(result);
});

module.exports = router;
