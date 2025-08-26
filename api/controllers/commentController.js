// backend/controllers/commentController.js
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const pusher = require('../config/pusher');

/**
 * @desc    Mendapatkan semua komentar untuk sebuah tugas
 * @route   GET /api/tasks/:taskId/comments
 * @access  Private
 */
exports.getCommentsForTask = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('authorId', 'username') // Ambil username penulis komentar
      .sort({ createdAt: 'asc' }); // Urutkan dari yang terlama
    res.json(comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

/**
 * @desc    Menambahkan komentar baru ke sebuah tugas
 * @route   POST /api/tasks/:taskId/comments
 * @access  Private
 */
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    const { text, socketId } = req.body;

    const newComment = await Comment.create({
      text,
      taskId: req.params.taskId,
      authorId: req.user.id, // ID pengguna diambil dari token
    });

    // Populate authorId agar bisa langsung ditampilkan di frontend
    const populatedComment = await Comment.findById(newComment._id).populate(
      'authorId',
      'username'
    );

    await pusher.trigger(
      `task-${req.params.taskId}`,
      'comment:added',
      populatedComment,
      { socketId: socketId }
    );
    console.log(
      `Komentar baru dikirim ke Pusher channel task-${req.params.taskId}`
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};
