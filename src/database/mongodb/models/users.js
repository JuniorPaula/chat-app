const mongoose = require('mongoose');
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

const User = mongoose.model('user', UserSchema);

module.exports = User;
