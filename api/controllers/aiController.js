// backend/controllers/aiController.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Task = require('../models/Task');

// Inisialisasi model AI dengan API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * @desc    Mengajukan pertanyaan ke AI Tutor berdasarkan konteks tugas
 * @route   POST /api/ai/ask
 * @access  Private (Hanya Mentee)
 */
exports.askAI = async (req, res) => {
  try {
    const { question, taskId } = req.body;

    // 1. Validasi Input
    if (!question || !taskId) {
      return res
        .status(400)
        .json({ message: 'Pertanyaan dan ID Tugas dibutuhkan.' });
    }

    // 2. Ambil Konteks Tugas dari Database
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan.' });
    }

    // 3. Prompt Engineering: Buat prompt yang cerdas untuk AI
    const prompt = `
      Anda adalah seorang AI Tutor ahli dalam pemrograman dan pengembangan perangkat lunak.
      Seorang mentee sedang mengerjakan tugas berikut:
      - Judul Tugas: "${task.title}"
      - Deskripsi Tugas: "${task.description}"
      
      Mentee tersebut memiliki pertanyaan: "${question}"

      Berikan jawaban yang membantu, jelas, dan relevan dengan konteks tugas di atas. Sapa mentee dengan ramah dan fokus untuk membantunya menyelesaikan tugas tersebut.
    `;

    // 4. Panggil Google Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Kirim jawaban AI kembali ke frontend
    res.json({ answer: text });
  } catch (error) {
    console.error('Error saat menghubungi AI:', error);
    res
      .status(500)
      .send('Terjadi kesalahan saat mencoba bertanya pada AI Tutor.');
  }
};
