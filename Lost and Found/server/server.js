require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('MongoDB Atlas Connected');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle chat messages
  socket.on('sendMessage', (data) => {
    io.to(data.room).emit('receiveMessage', data);
  });

  // Join chat room
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });
});

// Routes will be added here
app.use('/api/users', require('./routes/users'));
app.use('/api/items', require('./routes/items'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
