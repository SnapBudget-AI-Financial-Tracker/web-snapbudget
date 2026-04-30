// backend/src/controllers/savingGoalController.js
import prisma from '../config/prisma.js';
import { checkGoalBadges, awardBadge } from '../services/gamificationService.js';
/**
 * Get semua saving goals user
 */
export const getSavingGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals  = await prisma.SavingGoal.findMany({
      where    : { userId },
      orderBy  : { createdAt: 'desc' },
    });

    // Hitung progress dan sisa hari untuk setiap goal
    const goalsWithProgress = goals.map(goal => {
      const now          = new Date();
      const deadline     = new Date(goal.deadline);
      const daysLeft     = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      const progress     = goal.targetAmount > 0
        ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        : 0;
      const sisaAmount   = Math.max(0, goal.targetAmount - goal.currentAmount);
      const perHari      = daysLeft > 0 ? sisaAmount / daysLeft : 0;
      const perBulan     = daysLeft > 0 ? sisaAmount / Math.max(1, Math.ceil(daysLeft / 30)) : 0;

      return {
        ...goal,
        progress      : Math.round(progress * 10) / 10,
        daysLeft      : Math.max(0, daysLeft),
        sisaAmount,
        perHari       : Math.round(perHari),
        perBulan      : Math.round(perBulan),
        isOverdue     : daysLeft < 0 && goal.status === 'aktif',
        isTercapai    : goal.currentAmount >= goal.targetAmount,
      };
    });

    res.json(goalsWithProgress);
  } catch (error) {
    console.error('Get saving goals error:', error);
    res.status(500).json({ message: 'Gagal mengambil data goals' });
  }
};

/**
 * Buat saving goal baru
 */
export const createSavingGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, targetAmount, deadline, kategori, icon, currentAmount } = req.body;

    if (!nama || !targetAmount || !deadline) {
      return res.status(400).json({
        message: 'nama, targetAmount, dan deadline wajib diisi'
      });
    }

    const goal = await prisma.savingGoal.create({
      data: {
        userId,
        nama,
        targetAmount  : parseFloat(targetAmount),
        currentAmount : parseFloat(currentAmount || 0),
        deadline      : new Date(deadline),
        kategori      : kategori || 'umum',
        icon          : icon || '🎯',
        status        : 'aktif',
      },
    });
      // Cek badge goal
    await checkGoalBadges(userId);

    res.status(201).json(goal);
  } catch (error) {
    console.error('Create saving goal error:', error);
    res.status(500).json({ message: 'Gagal membuat goal' });
  }
};

/**
 * Update saving goal (tambah tabungan / edit)
 */
export const updateSavingGoal = async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;
    const { nama, targetAmount, deadline, kategori, icon, currentAmount, status } = req.body;

    const goal = await prisma.savingGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal tidak ditemukan' });
    }

    const updated = await prisma.savingGoal.update({
      where: { id },
      data : {
        nama          : nama          ?? goal.nama,
        targetAmount  : targetAmount  ? parseFloat(targetAmount)  : goal.targetAmount,
        currentAmount : currentAmount ? parseFloat(currentAmount) : goal.currentAmount,
        deadline      : deadline      ? new Date(deadline)        : goal.deadline,
        kategori      : kategori      ?? goal.kategori,
        icon          : icon          ?? goal.icon,
        status        : status        ?? goal.status,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update saving goal error:', error);
    res.status(500).json({ message: 'Gagal update goal' });
  }
};

/**
 * Tambah uang ke saving goal
 */
export const addToSavingGoal = async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.user.id;
    const { amount } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Amount harus lebih dari 0' });
    }

    const goal = await prisma.savingGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal tidak ditemukan' });
    }

    const newAmount = goal.currentAmount + parseFloat(amount);
    const newStatus = newAmount >= goal.targetAmount ? 'tercapai' : 'aktif';

    const updated = await prisma.savingGoal.update({
      where: { id },
      data : {
        currentAmount: newAmount,
        status       : newStatus,
      },
    });

    if (newStatus === 'tercapai') {
      await checkGoalBadges(userId);
    }
    res.json({
      ...updated,
      tercapai : newStatus === 'tercapai',
      message  : newStatus === 'tercapai'
        ? '🎉 Selamat! Goal kamu sudah tercapai!'
        : `Berhasil menambah Rp ${parseFloat(amount).toLocaleString('id-ID')}`,
    });
  } catch (error) {
    console.error('Add to saving goal error:', error);
    res.status(500).json({ message: 'Gagal menambah tabungan' });
  }
}
/**
 * Hapus saving goal
 */
export const deleteSavingGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const goal = await prisma.savingGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal tidak ditemukan' });
    }

    await prisma.savingGoal.delete({ where: { id } });
    res.json({ message: 'Goal berhasil dihapus' });
  } catch (error) {
    console.error('Delete saving goal error:', error);
    res.status(500).json({ message: 'Gagal menghapus goal' });
  }
};