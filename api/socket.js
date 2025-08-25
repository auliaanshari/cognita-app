// api/socket.js
const { Server } = require('socket.io');

const SocketHandler = (req, res) => {
  // Cek apakah server socket sudah berjalan
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    // Buat server socket baru dan tempelkan ke server HTTP utama
    const io = new Server(res.socket.server, {
      path: '/api/socket', // Gunakan path kustom kita
      cors: {
        origin: '*', // Izinkan semua origin untuk sementara (untuk debugging)
      },
    });
    res.socket.server.io = io;

    // Semua logika 'io.on('connection', ...)' Anda pindah ke sini
    io.on('connection', (socket) => {
      console.log(`✨ User terhubung via socket.js: ${socket.id}`);

      socket.on('user:join', (userId) => {
        socket.join(userId);
      });
      socket.on('board:join', (boardId) => {
        socket.join(boardId);
      });
      socket.on('task:join', (taskId) => {
        socket.join(taskId);
      });
      socket.on('task:leave', (taskId) => {
        socket.join(taskId);
      });

      socket.on('card:move', (data) => {
        socket.to(data.boardId).emit('card:moved', data);
      });

      socket.on('task:add', (data) => {
        socket.to(data.boardId).emit('task:added', data.newTask);
      });

      socket.on('disconnect', () => {
        console.log(`🔥 User terputus: ${socket.id}`);
      });
    });
  }
  res.end();
};

export default SocketHandler;
