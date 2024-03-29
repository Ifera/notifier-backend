const bcrypt = require('bcrypt');
const { User } = require('../../models/user');
const { BadRequest, ConflictError } = require('../../utils/error');

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

  const user = await User.findOne({ email });
  if (user) throw new ConflictError('User with same email already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let newUser = new User({
    email,
    password: hashedPassword,
  });

  newUser = await newUser.save();

  if (!newUser) throw new BadRequest('Error creating user');

  const token = newUser.generateAuthToken();
  return {
    token,
  };
}

module.exports = {
  login,
  createUser,
};
