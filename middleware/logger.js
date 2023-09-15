const winston = require('winston');
const expressWinston = require('express-winston');
const _ = require('lodash');
const { combinedFormat } = require('../startup/logging');

const expressLogger = expressWinston.logger({
  winstonInstance: winston,
  format: combinedFormat,
  meta: true,
  expressFormat: false,
  colorize: false,

  dynamicMeta: (req) => ({
    traceID: req.traceID,
  }),

  msg: (req, res) => {
    let body = _.omit(req.body, ['password']);
    body = JSON.stringify(body);
    return `${req.method} ${req.url} ${res.statusCode} ${res.responseTime}ms - ${body}`;
  },
});

module.exports = {
  expressLogger,
};
