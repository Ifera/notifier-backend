const Joi = require('joi');
const winston = require('winston');

module.exports = function () {
  // eslint-disable-next-line global-require
  Joi.objectId = require('joi-objectid')(Joi);

  winston.debug('init validation');
};
