// backend/controllers/taskController.js

const Task = require('../models/Task');
const Column = require('../models/Column');

exports.createTask = async (req, res) => {
  if (req.user.role !== 'mentor') {
    return res.status(403).json({
      message: 'Akses ditolak. Hanya mentor yang bisa membuat tugas.',
    });
  }
  try {
    const { title, description, menteeId, boardId } = req.body;
    const mentorId = req.user.id;

    if (!boardId || !menteeId) {
      return res
        .status(400)
        .json({ message: 'boardId dan menteeId dibutuhkan.' });
    }

    const newTask = await Task.create({
      title,
      description,
      menteeId,
      mentorId,
      boardId,
    });

    const todoColumn = await Column.findOne({ boardId, title: 'To Do' });
    if (todoColumn) {
      todoColumn.taskIds.push(newTask._id);
      await todoColumn.save();
    }

    // Populate semua data yang dibutuhkan frontend
    const populatedTask = await Task.findById(newTask._id)
      .populate('menteeId', 'username email')
      .populate('mentorId', 'username');

    // Kirim notifikasi ke mentee
    const io = req.app.get('socketio');
    const menteeRoomId = populatedTask.menteeId._id.toString();

    if (populatedTask.mentorId && populatedTask.mentorId.username) {
      const notificationMessage = {
        message: `Anda mendapatkan tugas baru: "${populatedTask.title}" dari mentor ${populatedTask.mentorId.username}.`,
      };
      io.to(menteeRoomId).emit('notification:new', notificationMessage);
      console.log(`[Notification] Notifikasi dikirim ke room: ${menteeRoomId}`);
    }

    io.to(boardId).emit('task:added', populatedTask);
    console.log(`[Real-time] Event task:added disebar ke board: ${boardId}`);

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    if (task.mentorId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Otorisasi gagal.' });
    }

    await Column.updateMany(
      { boardId: task.boardId },
      { $pull: { taskIds: task._id } }
    );

    await Task.findByIdAndDelete(req.params.id);

    const io = req.app.get('socketio');
    io.to(task.boardId.toString()).emit('task:removed', {
      taskId: req.params.id,
    });

    res.json({ message: 'Tugas berhasil dihapus.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};
