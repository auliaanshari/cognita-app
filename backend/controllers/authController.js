// backend/controllers/authController.js
const User = require('../models/User');
const Board = require('../models/Board');
const Column = require('../models/Column');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @desc    Mendaftarkan pengguna baru
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    if (newUser.role === 'mentor') {
      const newBoard = await Board.create({ userId: newUser._id });
      const defaultColumns = ['To Do', 'In Progress', 'Done'];
      await Promise.all(
        defaultColumns.map((title, index) =>
          Column.create({ title, boardId: newBoard._id, order: index })
        )
      );
      console.log(`✅ Board baru dibuat untuk mentor: ${newUser.email}`);
    }

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

/**
 * @desc    Mengautentikasi pengguna & mendapatkan token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email atau kata sandi salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau kata sandi salah.' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};
