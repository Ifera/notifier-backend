const config = require('config');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: config.get('db_host'),
      port: config.get('db_port'),
      user: config.get('db_user'),
      password: config.get('db_password'),
      database: config.get('db_schema'),
      charset: 'utf8',
    },
    migrations: {
      directory: `${__dirname}/knex/migrations`,
    },
    seeds: {
      directory: `${__dirname}/knex/seeds`,
    },
  },
};
