import express from 'express';
import http, { get } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import Filter from 'bad-words';

import {
  generateLocationMessageObj,
  generateMessageObj
} from './utils/messages.js';
import { addUser, getUser, getUsersInRoom, removeUser } from './utils/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirPath = path.join(__dirname, '../public');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(publicDirPath));

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
  socket.on('join', (options, callback) => {
    const {error, user} = addUser({id: socket.id, ...options});

    if(error) {
      return callback(error);
    }

    socket.join(user.room)
    socket.emit('message', generateMessageObj('Admin', 'Welcome!!!'));
    socket.broadcast.to(user.room).emit('message', generateMessageObj(user.username, `${user.username} has joined`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback()
  });

  socket.on('sendMessage', (newMessage, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(newMessage)) {
      return callback('Profanity is not allowed');
    }
    io.to(user.room).emit('message', generateMessageObj(user.username, newMessage));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessageObj(
        user.username,
        `https://google.com/maps?q=${coords.lat},${coords.lng}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if(user) {
      io.to(user.room).emit('message', generateMessageObj(user.username, `${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});


server.listen(port, () => {
  console.log(`server up and listening on ${port}`);
});
