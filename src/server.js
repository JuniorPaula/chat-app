require('dotenv/config');
require('./database/mongodb/connection');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const userRoutes = require('./routes/users');
const Message = require('./database/mongodb/models/messages');
const User = require('./database/mongodb/models/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'GET'],
  },
});

const rooms = ['geral', 'RH', 'financeiro', 'desenvolvimento'];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/users', userRoutes);

app.get('/rooms', (req, res) => {
  res.json(rooms);
});

async function getLastMessagesFromRooms(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: '$date', messagesBydate: { $push: '$$ROOT' } } },
  ]);

  return roomMessages;
}

function sortRoomMessagesByDate(messages) {
  return messages.sort((a, b) => {
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

io.on('connection', (socket) => {
  socket.on('new-user', async () => {
    const members = await User.find();
    io.emit('new-user', members);
  });

  socket.on('join-room', async (newRoom, previusRoom) => {
    socket.join(newRoom);
    socket.leave(previusRoom);
    let roomMessages = await getLastMessagesFromRooms(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages);
  });

  socket.on('message-room', async (room, content, sender, time, date) => {
    // eslint-disable-next-line no-unused-vars
    const newMessage = await Message.create({
      content,
      from: sender,
      time,
      date,
      to: room,
    });
    let roomMessage = await getLastMessagesFromRooms(room);
    roomMessage = sortRoomMessagesByDate(roomMessage);

    io.to(room).emit('room-message', roomMessage);

    socket.broadcast.emit('notifications', room);
  });

  app.delete('/users/logout', async (req, res) => {
    try {
      const { _id, newMessage } = req.body;
      const user = await User.findById(_id);
      user.status = 'offline';
      user.newMessage = newMessage;
      await user.save();
      const members = await User.find();

      socket.broadcast.emit('new-user', members);

      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(400).send();
    }
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.info(`Server is running on port ${PORT}`));
