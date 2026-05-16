// backend/src/controllers/chatbotController.js
import prisma from '../config/prisma.js';
import { generateChatResponse } from '../services/chatbotService.js';

export const chat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, conversationHistory = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Pesan tidak boleh kosong' });
    }

    const now   = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const [user, transaksi] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: new Date(tahun, bulan - 1, 1),
            lte: new Date(tahun, bulan, 0),
          },
        },
        orderBy: { date: 'desc' },
        take: 20,
      }),
    ]);

    const CATEGORIES = [
      'makanan','minuman','transportasi','belanja',
      'tagihan','hiburan','kesehatan','lain_lain'
    ];

    const actualPerKategori = {};
    CATEGORIES.forEach(cat => { actualPerKategori[cat] = 0; });
    transaksi.forEach(t => {
      const cat = t.category.replace('-', '_');
      if (CATEGORIES.includes(cat)) {
        actualPerKategori[cat] += Math.abs(t.amount);
      }
    });

    const totalPengeluaran = Object.values(actualPerKategori).reduce((s, v) => s + v, 0);
    const budgetBulanan    = user?.budgetBulanan || 2000000;
    const sisaBudget       = budgetBulanan - totalPengeluaran;
    const daysRemaining    = new Date(tahun, bulan, 0).getDate() - now.getDate();

    const pct = (totalPengeluaran / budgetBulanan) * 100;
    let statusKeuangan = 'HEMAT';
    if (pct > 90)      statusKeuangan = 'DARURAT';
    else if (pct > 70) statusKeuangan = 'WASPADA';
    else if (pct > 50) statusKeuangan = 'AMAN';

    const result = await generateChatResponse({
      userMessage         : message,
      conversationHistory,
      userContext: {
        totalPengeluaran,
        budgetBulanan,
        sisaBudget,
        daysRemaining,
        statusKeuangan,
        actualPerKategori,
        transaksiTerbaru: transaksi.slice(0, 5),
      },
    });

    res.json({
      response      : result.response,
      status_keuangan: statusKeuangan,
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Chatbot error:', error);
    }
    res.status(500).json({ message: 'Gagal mendapatkan respons AI' });
  }
};