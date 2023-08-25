const { v4: uuidv4 } = require('uuid');

module.exports = function (req, res, next) {
  let traceID = req.header('X-Trace-ID');

  if (!traceID) {
    traceID = uuidv4();
    res.setHeader('X-Trace-ID', traceID);
  }

  req.traceID = traceID;

  next();
};
