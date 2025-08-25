// backend/index.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const Task = require('./models/Task');
const Column = require('./models/Column');

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

const io = new Server(server, {
  cors: corsOptions,
});

app.set('socketio', io);

app.use(express.json());
app.use(cors(corsOptions));

io.on('connection', (socket) => {
  console.log(`✨ User terhubung: ${socket.id}`);

  socket.on('user:join', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} bergabung ke room pribadinya: ${userId}`);
  });

  socket.on('board:join', (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.id} bergabung ke board ${boardId}`);
  });

  socket.on('card:move', async (data) => {
    try {
      const { cardId, sourceColumnId, destColumnId, boardId } = data;

      await Column.findByIdAndUpdate(sourceColumnId, {
        $pull: { taskIds: cardId },
      });

      const destColumn = await Column.findByIdAndUpdate(
        destColumnId,
        {
          $push: { taskIds: cardId },
        },
        { new: true } // <-- Dapatkan dokumen yang sudah diupdate
      );

      let updatedTask = null;
      if (destColumn) {
        updatedTask = await Task.findByIdAndUpdate(
          cardId,
          { status: destColumn.title },
          { new: true } // <-- Dapatkan task yang sudah terupdate
        ).populate('menteeId', 'username'); // <-- Populate data yang dibutuhkan frontend
      }

      socket.to(boardId).emit('card:moved', { ...data, updatedTask });

      console.log(
        `✅ Kartu ${cardId} berhasil dipindahkan dan disimpan ke DB.`
      );
    } catch (error) {
      console.error('🔥 Error saat memindahkan kartu:', error);
    }
  });

  socket.on('task:add', (data) => {
    socket.to(data.boardId).emit('task:added', data.newTask);
  });

  socket.on('task:remove', (data) => {
    socket.to(data.boardId).emit('task:removed', { taskId: data.taskId });
    console.log(
      `✅ Event task:remove untuk ${data.taskId} disebarkan ke board ${data.boardId}`
    );
  });

  socket.on('card:reorder', async (data) => {
    try {
      const { boardId, columnId, taskIds } = data;
      await Column.findByIdAndUpdate(columnId, { taskIds: taskIds });

      socket.to(boardId).emit('card:reordered', data);

      console.log(`✅ Urutan kartu di kolom ${columnId} telah disimpan.`);
    } catch (error) {
      console.error('🔥 Error saat reorder kartu:', error);
    }
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

// Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/columns', require('./routes/columnRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

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
