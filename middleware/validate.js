// eslint-disable-next-line consistent-return
module.exports.validateQueryParams = (validator) => (req, res, next) => {
  const { error } = validator(req.query);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};

// eslint-disable-next-line consistent-return
module.exports.validateReq = (validator) => (req, res, next) => {
  const { error } = validator(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};
