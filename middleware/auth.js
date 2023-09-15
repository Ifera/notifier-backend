const jwt = require('jsonwebtoken');
const config = require('config');

// eslint-disable-next-line consistent-return
module.exports = function (req, res, next) {
  const token = req.header('x-auth-token').split(' ')[1];

  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).send('Unauthorized Request.');
  }
};
