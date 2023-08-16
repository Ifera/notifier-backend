const mongoose = require('mongoose');

// eslint-disable-next-line consistent-return
module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('Invalid ID.');

  next();
};
