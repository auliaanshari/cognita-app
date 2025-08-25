// backend/routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const { getBoard, getMyBoard } = require('../controllers/boardController');
const auth = require('../middleware/auth');

console.log('Router /api/boards sedang diakses...');

router.get('/my-board', auth, getMyBoard);

// Get a specific board by its ID
// We use 'auth' middleware to ensure only logged-in users can access boards
router.get('/:id', auth, getBoard);

module.exports = router;
