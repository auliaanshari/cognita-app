// backend/middleware/admin.js

const admin = (req, res, next) => {
  // Middleware ini harus dijalankan SETELAH middleware auth
  if (req.user && req.user.role === 'admin') {
    next(); // Lanjutkan jika pengguna adalah admin
  } else {
    res.status(403).json({ message: 'Akses ditolak. Rute khusus admin.' });
  }
};

module.exports = admin;
