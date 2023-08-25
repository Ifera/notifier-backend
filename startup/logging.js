const winston = require('winston');
const config = require('config');

const { format, transports } = winston;

const logFormat = format.printf(
  ({ timestamp, level, message, meta, ...opts }) => {
    let traceID;

    if (meta && meta.traceID) {
      traceID = meta.traceID;
    } else if (opts.traceID) {
      traceID = opts.traceID;
    } else {
      traceID = '-';
    }

    return `[${timestamp}] [${level}] [${traceID}] ${message}`;
  },
);

const combinedFormat = format.combine(
  format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  logFormat,
);

module.exports = function () {
  winston.configure({
    level: config.get('log.level'),
    format: combinedFormat,
    transports: [
      new transports.File({
        filename: './logs/error.log',
        level: 'error',
        format: combinedFormat,
      }),
      new winston.transports.File({ filename: './logs/combined.log' }),
    ],
    exceptionHandlers: [
      new transports.File({
        filename: './logs/exceptions.log',
      }),
      new transports.Console({
        format: combinedFormat,
      }),
    ],
  });

  if (config.get('log.console')) {
    winston.add(
      new transports.Console({
        format: format.combine(format.colorize(), combinedFormat),
      }),
    );
  }

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

  winston.debug('init logging');
};

module.exports.logFormat = logFormat;
module.exports.combinedFormat = combinedFormat;
