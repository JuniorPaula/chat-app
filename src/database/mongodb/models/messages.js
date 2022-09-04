const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
  content: String,
  from: Object,
  socketId: String,
  time: String,
  date: String,
  to: String,
});

const Message = mongoose.model('message', MessageSchema);

module.exports = Message;
