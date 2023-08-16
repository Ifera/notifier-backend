const config = require('config');
const winston = require('winston');

module.exports = function () {
  if (!config.get('jwt_private_key')) {
    throw new Error('FATAL ERROR: jwt_private_key is not defined.');
  }

  if (!config.get('db_type')) {
    throw new Error('FATAL ERROR: db_type is not defined.');
  }

  winston.debug('init config');
};
