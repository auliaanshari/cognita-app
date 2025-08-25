// backend/index.js

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
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

// Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/columns', require('./routes/columnRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/drag', require('./routes/dragRoutes'));

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    // vercel deploy
    // server.listen(PORT, () => {
    //   console.log(`🚀 Server berjalan di port ${PORT}`);
    // });
  } catch (error) {
    console.error('Gagal memulai server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; // vercel deploy
