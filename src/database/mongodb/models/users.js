const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome não pode estar vazio'],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      riquired: [true, 'Email não pode estar vazio'],
      index: true,
      validate: [isEmail, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'Senha não pode estar vazio'],
    },
    picture: {
      type: String,
    },
    newMessage: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      default: 'online',
    },
  },
  { minimize: false },
);

UserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = User.findOne({ email });
  if (!user) throw new Error('email ou senha inválidos');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('email ou senha inválidos');
  return user;
};

const User = mongoose.model('user', UserSchema);

module.exports = User;
