const config = require('config');

const DB_TYPE = config.get('db.type');
const USE_MONGO_DB = DB_TYPE === 'mongodb';
const IS_TEST_ENV = config.get('env') === 'test';

module.exports = {
  DB_TYPE,
  USE_MONGO_DB,
  IS_TEST_ENV,
};
