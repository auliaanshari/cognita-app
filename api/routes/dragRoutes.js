// api/routes/dragRoutes.js
const express = require('express');
const router = express.Router();
const { moveTask, reorderTask } = require('../controllers/dragController');
const auth = require('../middleware/auth');

router.put('/move', auth, moveTask);
router.put('/reorder', auth, reorderTask);

module.exports = router;
