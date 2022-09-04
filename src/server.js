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
    { $match: { $to: room } },
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

  socket.on('join-room', async (room) => {
    socket.join(room);
    let roomMessages = await getLastMessagesFromRooms(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages);
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.info(`Server is running on port ${PORT}`));
