const jwt = require('jsonwebtoken');

// No need to call dotenv.config() here, as it's handled in index.js

module.exports = function (req, res, next) {
  console.log('1. Middleware Auth dijalankan...');

  const authHeader = req.headers.authorization;

  // 1. Check for the header at the beginning.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(
      '4b. Akses ditolak, header Authorization tidak ada atau format salah.'
    );
    return res.status(401).json({ message: 'Akses ditolak. Tidak ada token.' });
  }

  // 2. Use a single try...catch block to handle everything.
  try {
    const token = authHeader.split(' ')[1];
    console.log('2. Token ditemukan:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('3. Token berhasil di-decode:', decoded);

    req.user = decoded.user;
    next(); // Proceed to the controller
  } catch (err) {
    console.error('4a. Token GAGAL diverifikasi:', err.message);
    return res.status(401).json({ message: 'Token tidak valid.' });
  }
};
