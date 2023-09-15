const express = require('express');

const { DB_TYPE } = require('../globals');

const { getTags } = require(`../controllers/${DB_TYPE}/tag`); // eslint-disable-line

const router = express.Router();

const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const result = await getTags(req.query);

  res.send(result.map((r) => r.label));
});

module.exports = router;
