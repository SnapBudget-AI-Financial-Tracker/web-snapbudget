import prisma from '../config/prisma.js';
import { scanStruk as aiScanStruk, getPrediksi } from '../services/inferenceService.js';

/**
 * Scan struk via AI
 */
export const scanStruk = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'File struk diperlukan' });
    }

    // Ambil budget user dari DB
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Kirim ke AI server Modal
    const aiResult = await aiScanStruk(
      req.file.buffer,
      req.file.originalname,
      {
        budget_bulanan: user.budgetBulanan || 2000000,
        day_of_month: new Date().getDate(),
        saldo_sisa: 0,
      }
    );

    if (aiResult.status !== 'success') {
      return res.status(422).json({ message: 'Struk tidak terbaca' });
    }

    // Simpan semua item ke DB
    const transaksiList = aiResult.scan_result.items.map(item => ({
      userId,
      amount: -item.harga, // negatif = pengeluaran
      category: item.kategori,
      description: item.item_name,
      date: new Date(),
      receiptUrl: null,
    }));

    await prisma.transaction.createMany({ data: transaksiList });

    // Add missing fields for frontend compatibility
    if (aiResult.rekomendasi) {
      aiResult.rekomendasi.label_upper = aiResult.rekomendasi.label?.toUpperCase() || 'AMAN';
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      aiResult.rekomendasi.days_remaining = lastDayOfMonth - now.getDate();
    }

    // Return hasil lengkap ke frontend
    res.json({
      success: true,
      scan_result: aiResult.scan_result,
      prediksi_7hari: aiResult.prediksi_7hari,
      rekomendasi: aiResult.rekomendasi,
      status_per_kategori: aiResult.status_per_kategori,
      transaksi_disimpan: transaksiList.length,
    });
  } catch (error) {
    console.error('Scan struk error:', error);
    res.status(500).json({ message: 'Gagal memproses struk' });
  }
};

/**
 * Get dashboard data + AI prediction
 */
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    // Ambil semua transaksi bulan ini
    const transaksi = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(tahun, bulan - 1, 1),
          lte: new Date(tahun, bulan, 0),
        }
      }
    });

    // Hitung actual per kategori
    const CATEGORIES = [
      'makanan',
      'minuman',
      'transportasi',
      'belanja',
      'tagihan',
      'hiburan',
      'kesehatan',
      'lain_lain'
    ];

    const actualHariIni = {};
    CATEGORIES.forEach(cat => { actualHariIni[cat] = 0; });

    transaksi.forEach(t => {
      const cat = t.category.replace('-', '_');
      if (CATEGORIES.includes(cat)) {
        actualHariIni[cat] += Math.abs(t.amount);
      }
    });

    // Ambil user untuk budget
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Ambil prediksi + rekomendasi dari AI
    const aiResult = await getPrediksi(actualHariIni, {
      budget_bulanan: user.budgetBulanan || 2000000,
      day_of_month: now.getDate(),
    });

    // Add missing fields for frontend compatibility
    if (aiResult.rekomendasi) {
      aiResult.rekomendasi.label_upper = aiResult.rekomendasi.label?.toUpperCase() || 'AMAN';
      aiResult.rekomendasi.days_remaining = new Date(tahun, bulan, 0).getDate() - now.getDate();
    }

    res.json({
      transaksi_bulan_ini: transaksi,
      actual_per_kategori: actualHariIni,
      prediksi_7hari: aiResult.prediksi_7hari,
      rekomendasi: aiResult.rekomendasi,
      status_per_kategori: aiResult.status_per_kategori,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Gagal memuat dashboard' });
  }
};

/**
 * Create a new transaction
 */
export const createTransaction = async (req, res) => {
  try {
    const { amount, category, description, date, receiptUrl } = req.body;
    const userId = req.user.id;

    if (!amount || !category) {
      return res.status(400).json({ message: 'Amount and category are required' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
        receiptUrl,
        userId,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all transactions for the authenticated user
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single transaction by ID
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a transaction
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category, description, date, receiptUrl } = req.body;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        description,
        date: date ? new Date(date) : undefined,
        receiptUrl,
      },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
