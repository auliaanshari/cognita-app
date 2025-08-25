// backend/controllers/columnController.js

const Column = require('../models/Column');

/**
 * @desc    Reorder tasks within a column
 * @route   PUT /api/columns/:id/reorder
 * @access  Private
 */
exports.reorderColumnTasks = async (req, res) => {
  try {
    const { taskIds } = req.body; // Expecting an array of the new task IDs
    const columnId = req.params.id;

    const column = await Column.findById(columnId);

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    // Update the taskIds array with the new order
    column.taskIds = taskIds;
    await column.save();

    res.status(200).json({ success: true, data: column });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
