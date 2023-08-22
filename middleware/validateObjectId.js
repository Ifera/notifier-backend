const mongoose = require('mongoose');
const { USE_MONGO_DB } = require('../globals');

// eslint-disable-next-line consistent-return
module.exports = function (req, res, next) {
  if (USE_MONGO_DB && !mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('Invalid ID.');

  next();
};
