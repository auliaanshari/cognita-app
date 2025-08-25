// backend/controllers/userController.js
const User = require('../models/User');

/**
 * @desc    Mendapatkan semua pengguna dengan peran mentee
 * @route   GET /api/users/mentees
 * @access  Private
 */
exports.getMentees = async (req, res) => {
  try {
    const mentees = await User.find({ role: 'mentee' }).select('_id username');
    res.json(mentees);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

/**
 * @desc    Mendapatkan semua pengguna
 * @route   GET /api/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Ambil semua pengguna tapi jangan sertakan password mereka
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

/**
 * @desc    Mengupdate pengguna (misal: mengubah peran)
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // Update field yang relevan
    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};

/**
 * @desc    Menghapus pengguna
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    // TODO: Tambahkan logika untuk menangani tugas-tugas yang terkait dengan pengguna yang dihapus
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Kesalahan Server');
  }
};
