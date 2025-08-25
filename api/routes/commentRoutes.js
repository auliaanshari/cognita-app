// backend/routes/commentRoutes.js
const express = require('express');
// mergeParams: true agar bisa mengakses :taskId dari parent router (taskRoutes)
const router = express.Router({ mergeParams: true });
const {
  getCommentsForTask,
  addComment,
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.route('/').get(auth, getCommentsForTask).post(auth, addComment);

module.exports = router;
