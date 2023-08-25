const winston = require('winston');
const config = require('config');

module.exports = function () {
  winston.configure({
    level: config.get('log.level'),
    format: winston.format.simple(),
    transports: [
      new winston.transports.File({
        filename: './logs/error.log',
        level: 'error',
      }),
      // new winston.transports.File({ filename: './logs/combined.log' }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ],
    exceptionHandlers: [
      new winston.transports.File({
        filename: './logs/exceptions.log',
      }),
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  // if (process.env.NODE_ENV !== "production") {
  // winston.add(
  //   new winston.transports.Console({
  //     format: winston.format.combine(
  //       winston.format.colorize(),
  //       winston.format.simple(),
  //     ),
  //   }),
  // );
  // }

  process.on('unhandledRejection', (ex) => {
    throw ex;
  });

  winston.debug('init logging');
};
