const express = require('express');
const winston = require('winston');
const cors = require('cors');

// middleware
const traceId = require('../middleware/traceId');
const logger = require('../middleware/logger');
const error = require('../middleware/error');

// routes
const apps = require('../routes/applications');
const events = require('../routes/events');
const notificationTypes = require('../routes/notificationtypes');
const messages = require('../routes/messages');

function addRoute(app, route, module) {
  app.use(route, module);

  winston.debug(`added route: ${route}`);
}

module.exports = function (app) {
  winston.debug('init routes');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.use(traceId);
  app.use(logger.expressLogger);

  addRoute(app, '/api/apps', apps);
  addRoute(app, '/api/events', events);
  addRoute(app, '/api/notification-types', notificationTypes);
  addRoute(app, '/api/message', messages);

  app.use(error);
};
