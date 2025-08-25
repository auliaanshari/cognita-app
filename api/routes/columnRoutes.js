// backend/routes/columnRoutes.js

const express = require('express');
const router = express.Router();
const { reorderColumnTasks } = require('../controllers/columnController');
const auth = require('../middleware/auth');

router.put('/:id/reorder', auth, reorderColumnTasks);

module.exports = router;
