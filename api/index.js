// api/index.js

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGIN || 'http://localhost:3000'
).split(',');
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/columns', require('./routes/columnRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
const taskRoutes = require('./routes/taskRoutes'); // Memastikan nested routes
app.use('/api/tasks', taskRoutes);

// --- Handler Utama untuk Vercel ---
const handler = (req, res) => {
  // Cek apakah server socket sudah ada
  if (!res.socket.server.io) {
    console.log('*First use, starting Socket.IO');

    // Buat server HTTP baru dari 'res' dan pasang Socket.IO
    const httpServer = res.socket.server;
    const io = new Server(httpServer, {
      path: '/api/socket',
      cors: corsOptions,
    });

    // Simpan instance 'io' agar bisa diakses di mana saja
    // dan juga di controller via req.app.get('socketio')
    app.set('socketio', io);
    res.socket.server.io = io;

    // Logika koneksi Socket.IO Anda
    io.on('connection', (socket) => {
      console.log(`✨ User terhubung: ${socket.id}`);
      socket.on('user:join', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} bergabung ke room user ${userId}`);
      });
      socket.on('board:join', (boardId) => {
        socket.join(boardId);
        console.log(`User ${socket.id} bergabung ke board ${boardId}`);
      });
      socket.on('task:join', (taskId) => {
        socket.join(taskId);
        console.log(`User ${socket.id} bergabung ke diskusi tugas ${taskId}`);
      });
      socket.on('task:leave', (taskId) => {
        socket.leave(taskId);
        console.log(`User ${socket.id} meninggalkan diskusi tugas ${taskId}`);
      });
      socket.on('disconnect', () => {
        console.log(`🔥 User terputus: ${socket.id}`);
      });
    });
  } else {
    console.log('Socket.IO already running');
  }

  // Teruskan permintaan ke aplikasi Express untuk ditangani
  return app(req, res);
};

// Jalankan koneksi DB
connectDB();

// Ekspor handler utama
module.exports = handler;
