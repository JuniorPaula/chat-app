require('dotenv/config');
require('./database/mongodb/connection');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);
// eslint-disable-next-line no-unused-vars
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

io.on('connection', (socket) => {
  socket.on('join-room', async (room) => {
    socket.join(room);
  });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.info(`Server is running on port ${PORT}`));
