// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMentees,
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// URL dasar: /api/users
router.get('/mentees', auth, getMentees);

// Rute khusus Admin
router.get('/', [auth, admin], getAllUsers);
router.put('/:id', [auth, admin], updateUser);
router.delete('/:id', [auth, admin], deleteUser);

module.exports = router;
