const express = require('express');
const winston = require('winston');
const cors = require('cors');

// middleware
const traceId = require('../middleware/traceId');
const logger = require('../middleware/logger');
const error = require('../middleware/error');
const authMiddleware = require('../middleware/auth');

// routes
const apps = require('../routes/applications');
const events = require('../routes/events');
const notificationTypes = require('../routes/notificationtypes');
const messages = require('../routes/messages');
const tags = require('../routes/tags');
const auth = require('../routes/auth');

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

  addRoute(app, '/api/auth', auth);

  app.use(authMiddleware);

  addRoute(app, '/api/apps', apps);
  addRoute(app, '/api/events', events);
  addRoute(app, '/api/notification-types', notificationTypes);
  addRoute(app, '/api/message', messages);
  addRoute(app, '/api/tags', tags);

  app.use(error);
};
