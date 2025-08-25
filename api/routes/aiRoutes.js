// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');
const auth = require('../middleware/auth');

// URL dasar untuk file ini adalah /api/ai
router.post('/ask', auth, askAI);

module.exports = router;
