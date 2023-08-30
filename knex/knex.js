const { ENV } = require('../globals');
const knexConfig = require('../knexfile')[ENV];

module.exports = require('knex')(knexConfig);
