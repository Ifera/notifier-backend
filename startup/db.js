const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

const { USE_MONGO_DB } = require('../globals');

module.exports = function () {
  winston.debug('init db');

  if (USE_MONGO_DB) {
    const db = config.get('mongo_db');
    mongoose.connect(db).then(() => winston.info('Connected to MongoDB...'));

    return;
  }

  // TODO: implement knex
  winston.debug('TODO');
};
