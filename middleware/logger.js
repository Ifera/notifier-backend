const winston = require('winston');
const expressWinston = require('express-winston');

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
    const body = JSON.stringify(req.body);
    return `${req.method} ${req.url} ${res.statusCode} ${res.responseTime}ms - ${body}`;
  },
});

module.exports = {
  expressLogger,
};
