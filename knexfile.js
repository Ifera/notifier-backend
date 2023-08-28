const config = require('config');

const data = {
  client: 'pg',
  connection: {
    host: config.get('db.postgres.host'),
    port: config.get('db.postgres.port'),
    user: config.get('db.postgres.user'),
    password: config.get('db.postgres.password'),
    database: config.get('db.postgres.schema'),
    charset: 'utf8',
  },
  migrations: {
    directory: `${__dirname}/knex/migrations`,
  },
  seeds: {
    directory: `${__dirname}/knex/seeds`,
  },
};

module.exports = {
  development: { ...data },
  production: { ...data },
  test: { ...data },
};
