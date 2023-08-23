require('express-async-errors');
const winston = require('winston');
const express = require('express');
const config = require('config');

const app = express();

require('./startup/logging')();
require('./startup/config')();
require('./startup/db')();
require('./startup/validation')();
require('./startup/routes')(app);

const port = config.get('port');
const server = app.listen(port, () =>
  winston.info(`Server started on port ${port}...`),
);

module.exports = server;
