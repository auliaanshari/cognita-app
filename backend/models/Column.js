// models/Column.js
const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    // Kolom ini milik board yang mana?
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Board',
    },
    // Array untuk menyimpan ID tugas (cards) yang ada di kolom ini
    taskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Column', columnSchema);
