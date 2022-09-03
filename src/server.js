require('dotenv/config');
require('./database/mongodb/connection');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
// eslint-disable-next-line no-unused-vars
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'GET'],
  },
});

// const rooms = ['geral', 'RH', 'financeiro', 'desenvolvimento'];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;
server.listen(PORT, () => console.info(`Server is running on port ${PORT}`));
