const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

const { USE_MONGO_DB, IS_TEST_ENV } = require('../globals');

module.exports = function () {
  winston.debug('init db');

  if (IS_TEST_ENV || USE_MONGO_DB) {
    winston.info('Using MongoDB');

    const uri = config.get('db.mongodb.uri');
    mongoose.connect(uri).then(() => winston.info('Connected to MongoDB...'));

    if (!IS_TEST_ENV) return;
  }

  winston.debug('Using Knex (postgres)');

  const conn = require('../knex/knex');

  conn
    .raw('SELECT 1+1 AS result')
    .then(() => winston.info('Connected to Postgres...'))
    .catch((err) => {
      winston.error('Could not connect to Postgres...');
      winston.error(err.message);
      process.exit(1);
    });
};
