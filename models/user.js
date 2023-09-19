const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('config');
const { USE_MONGO_DB } = require('../globals');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
});

userSchema.methods.generateAuthToken = function () {
  const jwtPrivateKey = config.get('jwtPrivateKey');
  const token = jwt.sign({ _id: this._id, email: this.email }, jwtPrivateKey, {
    expiresIn: '1h',
  });
  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
