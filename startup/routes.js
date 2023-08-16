const express = require('express');
const winston = require('winston');

// middleware
const error = require('../middleware/error');

// routes
const apps = require('../routes/applications');
const events = require('../routes/events');

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

  app.use(error);
};
