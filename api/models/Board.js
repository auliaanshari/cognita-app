// models/Board.js
const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true, // Ensure one board per user
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', boardSchema);
