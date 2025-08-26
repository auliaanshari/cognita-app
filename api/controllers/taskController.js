// backend/controllers/taskController.js

const Task = require('../models/Task');
const Column = require('../models/Column');
const pusher = require('../config/pusher');

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

    const boardChannel = `board-${populatedTask.boardId.toString()}`;

    await pusher.trigger(boardChannel, 'task:added', populatedTask);
    console.log(
      `[Pusher] Event 'task:added' dikirim ke channel: ${boardChannel}`
    );

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

    const boardId = task.boardId.toString();
    const taskId = task._id.toString();

    await Task.findByIdAndDelete(req.params.id);
    await Column.updateMany(
      { boardId: task.boardId },
      { $pull: { taskIds: task._id } }
    );

    const boardChannel = `board-${boardId}`;
    await pusher.trigger(boardChannel, 'task:removed', { taskId: taskId });
    console.log(
      `[Pusher] Event 'task:removed' dikirim ke channel: ${boardChannel}`
    );

    res.json({ message: 'Tugas berhasil dihapus.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};
