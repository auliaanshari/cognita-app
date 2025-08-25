// config/db.js
const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

const connectDB = async () => {
  try {
    console.log('Mencoba terhubung ke MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Opsi family: 4 bagus untuk mengatasi masalah DNS, bisa dipertahankan
      family: 4,
    });
    console.log(`✅ MongoDB Terhubung: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Gagal terhubung ke DB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
