// backend/controllers/boardController.js
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get a single board with all its columns and tasks
// @route   GET /api/my-board
// @access  Private
exports.getMyBoard = async (req, res) => {
  try {
    let board;
    // JIKA PENGGUNA ADALAH MENTOR
    if (req.user.role === 'mentor') {
      board = await Board.findOne({ userId: req.user.id });
      // Jika mentor belum punya board (kasus user baru), buatkan.
      if (!board) {
        console.log(
          `Board not found for mentor ${req.user.id}, creating one...`
        );
        board = await Board.create({ userId: req.user.id });
        const defaultColumns = ['To Do', 'In Progress', 'Done'];
        await Promise.all(
          defaultColumns.map((title, index) =>
            Column.create({ title, boardId: board._id, order: index })
          )
        );
      }
    }
    // JIKA PENGGUNA ADALAH MENTEE
    else {
      // Cari satu saja tugas yang ditugaskan ke mentee ini
      const assignedTask = await Task.findOne({ menteeId: req.user.id });

      if (assignedTask) {
        // Jika ada tugas, berarti dia punya akses ke board dari tugas itu
        board = await Board.findById(assignedTask.boardId);
      } else {
        // Jika tidak ada tugas, berarti dia belum punya board untuk dilihat
        return res.status(404).json({
          success: false,
          message: 'You have not been assigned to any board yet.',
        });
      }
    }

    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: 'Board not found.' });
    }

    res.status(200).json({ success: true, boardId: board._id });
  } catch (error) {
    console.error('🔥 Terjadi ERROR di getMyBoard:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single board with all its columns and tasks
// @route   GET /api/boards/:id
// @access  Private
exports.getBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const board = await Board.findById(boardId);

    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: 'Board not found' });
    }

    const isOwner = board.userId.toString() === req.user.id;
    let isAssignedMentee = false;

    if (req.user.role === 'mentee') {
      const taskOnThisBoard = await Task.findOne({
        boardId: boardId,
        menteeId: req.user.id,
      });
      if (taskOnThisBoard) {
        isAssignedMentee = true;
      }
    }

    // User boleh akses jika dia adalah pemilik ATAU dia adalah mentee yang punya tugas di board ini
    if (!isOwner && !isAssignedMentee) {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized to access this board' });
    }

    const columns = await Column.find({ boardId: boardId }).sort({ order: 1 });

    let tasksQuery = { boardId: boardId }; // Filter dasar: semua tugas di board ini

    // Jika yang meminta adalah mentee, tambahkan filter tambahan
    if (req.user.role === 'mentee') {
      tasksQuery.menteeId = req.user.id;
    }

    // Jalankan query yang sudah difilter
    const tasks = await Task.find(tasksQuery)
      .populate('mentorId', 'username')
      .populate('menteeId', 'username');

    console.log(`✅ Ditemukan ${tasks.length} tugas di board ${boardId}.`);

    const responseData = { board, columns, tasks };
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('🔥 Terjadi ERROR di dalam getBoard:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
