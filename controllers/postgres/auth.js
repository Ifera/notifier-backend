const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const knex = require('../../knex/knex');
const {
  NotFoundError,
  BadRequest,
  ConflictError,
} = require('../../utils/error');

async function createUser(req) {
  const { email, password } = req;

  const userExists = await knex('users').select('*').where({ email }).first();

  if (userExists)
    throw new ConflictError('User with same email already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    email,
    password: hashedPassword,
  };

  const ret = await knex('users').insert(newUser).returning('*');

  return !ret ? null : ret[0];
}

async function login(req) {
  const user = await knex('users')
    .select('*')
    .where({ email: req.email })
    .first();

  if (!user) throw new BadRequest('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.password, user.password);
  if (!validPassword) throw new BadRequest('Invalid email or password.');

  // TODO: Move this to Util/Models
  const jwtPrivateKey = config.get('jwtPrivateKey');
  const token = jwt.sign({ _id: user.id, email: user.email }, jwtPrivateKey, {
    expiresIn: '1h',
  });

  return {
    token,
  };
}

module.exports = {
  createUser,
  login,
};
