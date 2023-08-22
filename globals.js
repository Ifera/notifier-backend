const config = require('config');

const DB_TYPE = config.get('db_type');
const USE_MONGO_DB = DB_TYPE === 'mongodb';

module.exports = {
  DB_TYPE,
  USE_MONGO_DB,
};
