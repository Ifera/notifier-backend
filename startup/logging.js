const winston = require('winston');

module.exports = function () {
  winston.configure({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
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

  // winston.exceptions.handle(
  //   new winston.transports.File({
  //     filename: './logs/exceptions.log',
  //     format: winston.format.json(),
  //   }),
  //   new winston.transports.Console({
  //     format: winston.format.simple(),
  //   }),
  // );

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
