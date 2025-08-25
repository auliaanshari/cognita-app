// backend/controllers/commentController.js
const Comment = require('../models/Comment');
const Task = require('../models/Task');

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

    const newComment = await Comment.create({
      text: req.body.text,
      taskId: req.params.taskId,
      authorId: req.user.id, // ID pengguna diambil dari token
    });

    // Populate authorId agar bisa langsung ditampilkan di frontend
    const populatedComment = await Comment.findById(newComment._id).populate(
      'authorId',
      'username'
    );

    const io = req.app.get('socketio');
    const taskId = req.params.taskId;
    io.to(taskId).emit('comment:added', populatedComment);
    console.log(`Komentar baru disiarkan ke room tugas ${taskId}`);

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};
