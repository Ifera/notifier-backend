const config = require('config');
const winston = require('winston');

module.exports = function () {
  if (!config.get('port')) {
    throw new Error('FATAL ERROR: port is not defined.');
  }

  // if (!config.get('jwt_private_key')) {
  //   throw new Error('FATAL ERROR: jwt_private_key is not defined.');
  // }

  const dbType = config.get('db.type');

  if (!dbType) {
    throw new Error('FATAL ERROR: db.type is not defined.');
  }

  if (dbType !== 'mongodb' && dbType !== 'postgres') {
    throw new Error(
      'FATAL ERROR: db.type should be one of "mongodb" or "postgres".',
    );
  }

  if (dbType === 'mongodb' && !config.get('db.mongodb.uri')) {
    throw new Error('FATAL ERROR: db.mongodb.uri is not defined.');
  }

  if (dbType === 'postgres') {
    const requiredKeys = ['host', 'port', 'user', 'password', 'schema'];

    requiredKeys.forEach((key) => {
      if (!config.get(`db.postgres.${key}`)) {
        throw new Error(`FATAL ERROR: db.postgres.${key} is not defined.`);
      }
    });
  }

  winston.debug('init config');
};
