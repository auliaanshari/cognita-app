// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentRoutes = require('./commentRoutes');

const { createTask, deleteTask } = require('../controllers/taskController');

// URL dasar: /api/tasks
router.post('/', auth, createTask);
router.delete('/:id', auth, deleteTask);
router.use('/:taskId/comments', commentRoutes);

module.exports = router;
