const jwt = require('jsonwebtoken');
const config = require('config');

const { StatusCodes } = require('http-status-codes');

// eslint-disable-next-line consistent-return
module.exports = function (req, res, next) {
  if (!req.header('x-auth-token'))
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send('Access denied. No token provided.');

  const token = req.header('x-auth-token').split(' ')[1];

  if (!token)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    req.user = decoded;

    next();
  } catch (ex) {
    res.status(401).send('Unauthorized Request.');
  }
};
