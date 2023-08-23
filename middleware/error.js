const winston = require('winston');
const { ValidationError } = require('../utils/error');

module.exports = function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(400).send(err.message);
  }

  if (err.detail) {
    return res.status(400).send(err.detail);
  }

  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue).join(', ');
    const values = Object.values(err.keyValue).join(', ');

    return res.status(400).send(`Key (${keys})=(${values}) already exists.`);
  }

  winston.error(err);
  winston.error(err.stack);

  return res.status(500).send('Something failed.');
};
