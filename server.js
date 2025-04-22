const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve static files from the "public" directory

let users = {}; // Store connected users

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining with a username
  socket.on('join', (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the chat`);
    io.emit('user joined', { username, users: Object.values(users) }); // Notify all clients
  });

  // Handle chat messages
  socket.on('chat message', (data) => {
    const { message, sender } = data;
    console.log(`Message from ${sender}: ${message}`);
    io.emit('chat message', { sender, message }); // Broadcast the message to all clients
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(`${username} disconnected`);
      delete users[socket.id];
      io.emit('user left', { username, users: Object.values(users) }); // Notify all clients
    }
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});