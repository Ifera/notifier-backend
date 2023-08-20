const config = require('config');
const winston = require('winston');
// const db = require('./db');

module.exports = function () {
  if (!config.get('port')) {
    throw new Error('FATAL ERROR: port is not defined.');
  }

  // if (!config.get('jwt_private_key')) {
  //   throw new Error('FATAL ERROR: jwt_private_key is not defined.');
  // }

  const dbType = config.get('db_type');

  if (!dbType) {
    throw new Error('FATAL ERROR: db_type is not defined.');
  }

  if (dbType !== 'mongodb' && dbType !== 'postgres') {
    throw new Error(
      'FATAL ERROR: db_type should be one of "mongodb" or "postgres".',
    );
  }

  if (dbType === 'mongodb' && !config.get('mongodb_uri')) {
    throw new Error('FATAL ERROR: mongodb_uri is not defined.');
  }

  if (dbType === 'postgres') {
    const requiredKeys = [
      'db_host',
      'db_port',
      'db_user',
      'db_password',
      'db_schema',
    ];

    requiredKeys.forEach((key) => {
      if (!config.get(key)) {
        throw new Error(`FATAL ERROR: ${key} is not defined for postgres.`);
      }
    });
  }

  winston.debug('init config');
};
