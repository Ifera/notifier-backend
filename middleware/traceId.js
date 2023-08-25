const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

module.exports = function (req, res, next) {
  let traceID = req.get('X-Trace-ID');

  if (!traceID) {
    traceID = uuidv4();
    res.setHeader('X-Trace-ID', traceID);
  }

  req.traceID = traceID;

  next();
};
