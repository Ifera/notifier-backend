// eslint-disable-next-line consistent-return
module.exports = function (req, res, next) {
  // 401 Unauthorized
  // 403 Forbidden

  if (!req.user.isAdmin) return res.status(403).send('Access denied.');

  next();
};
