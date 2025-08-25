// api/controllers/dragController.js
const Column = require('../models/Column');
const Task = require('../models/Task');
const pusher = require('../config/pusher');

exports.moveTask = async (req, res) => {
  const { taskId, sourceColumnId, destColumnId } = req.body;
  const { boardId } = req.query; // Ambil boardId dari query param

  try {
    // 1. Update database
    await Column.findByIdAndUpdate(sourceColumnId, {
      $pull: { taskIds: taskId },
    });
    const destColumn = await Column.findByIdAndUpdate(destColumnId, {
      $push: { taskIds: taskId },
    });
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status: destColumn.title },
      { new: true }
    );

    // 2. Trigger Pusher event ke seluruh board
    const payload = { ...req.body, updatedTask };
    await pusher.trigger(`board-${boardId}`, 'card:moved', payload);

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.reorderTask = async (req, res) => {
  const { columnId, taskIds } = req.body;
  const { boardId } = req.query;

  try {
    // 1. Update database
    await Column.findByIdAndUpdate(columnId, { taskIds: taskIds });

    // 2. Trigger Pusher event ke seluruh board
    await pusher.trigger(`board-${boardId}`, 'card:reordered', {
      columnId,
      taskIds,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error reordering task:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
