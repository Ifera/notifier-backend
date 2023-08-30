const config = require('config');

const DB_TYPE = config.get('db.type');
const USE_MONGO_DB = DB_TYPE === 'mongodb';
const ENV = config.get('env');
const IS_TEST_ENV = ENV === 'test';

const itif = (condition) => (condition ? it : it.skip);

module.exports = {
  DB_TYPE,
  USE_MONGO_DB,
  ENV,
  IS_TEST_ENV,
  itif,
};
