const config = require('config');

const USE_MONGO_DB = config.get('db_type') === 'mongodb';

module.exports = {
  USE_MONGO_DB,
};
