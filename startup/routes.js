const express = require('express');
const winston = require('winston');

// middleware
const error = require('../middleware/error');

// routes
const apps = require('../routes/applications');
const events = require('../routes/events');
const notificationTypes = require('../routes/notificationtypes');

function addRoute(app, route, module) {
  app.use(route, module);

  winston.debug(`added route: ${route}`);
}

module.exports = function (app) {
  winston.debug('init routes');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  addRoute(app, '/api/apps', apps);
  addRoute(app, '/api/events', events);
  addRoute(app, '/api/notification-types', notificationTypes);

  app.use(error);
};
