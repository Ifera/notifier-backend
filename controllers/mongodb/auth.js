const bcrypt = require('bcrypt');
const { User } = require('../../models/user');
const { NotFoundError, BadRequest } = require('../../utils/error');

async function login(req) {
  const user = await User.findOne({ email: req.email });
  if (!user) throw new BadRequest('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.password, user.password);
  if (!validPassword) throw new BadRequest('Invalid email or password.');

  const token = user.generateAuthToken();

  return {
    token,
  };
}

async function createUser(req) {
  const { email, password } = req;

  const user = await User.findOne({ email: req.email });
  if (user) throw new BadRequest('User already registered.');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    email,
    password: hashedPassword,
  });

  return newUser.save();
}

module.exports = {
  login,
  createUser,
};
