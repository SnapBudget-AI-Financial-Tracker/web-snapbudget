import cloudinary from '../config/cloudinary.js';
import prisma from '../config/prisma.js';

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Convert buffer to base64 Data URI
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'snapbudget/avatars',
      public_id: `${req.user.id}-${Date.now()}`,
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face',
    });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: result.secure_url },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      }
    });

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const {
      budgetBulanan,
      budgetMakanan,
      budgetMinuman,
      budgetTransportasi,
      budgetBelanja,
      budgetTagihan,
      budgetHiburan,
      budgetKesehatan,
      budgetLainLain,
      tanggalGajian,
      targetTabungan,
      isOnboardingComplete,
    } = req.body;

    const updateData = {};
    
    if (budgetBulanan !== undefined) updateData.budgetBulanan = parseInt(budgetBulanan);
    if (budgetMakanan !== undefined) updateData.budgetMakanan = parseInt(budgetMakanan);
    if (budgetMinuman !== undefined) updateData.budgetMinuman = parseInt(budgetMinuman);
    if (budgetTransportasi !== undefined) updateData.budgetTransportasi = parseInt(budgetTransportasi);
    if (budgetBelanja !== undefined) updateData.budgetBelanja = parseInt(budgetBelanja);
    if (budgetTagihan !== undefined) updateData.budgetTagihan = parseInt(budgetTagihan);
    if (budgetHiburan !== undefined) updateData.budgetHiburan = parseInt(budgetHiburan);
    if (budgetKesehatan !== undefined) updateData.budgetKesehatan = parseInt(budgetKesehatan);
    if (budgetLainLain !== undefined) updateData.budgetLainLain = parseInt(budgetLainLain);
    if (tanggalGajian !== undefined) updateData.tanggalGajian = parseInt(tanggalGajian);
    if (targetTabungan !== undefined) updateData.targetTabungan = parseInt(targetTabungan);
    if (isOnboardingComplete !== undefined) updateData.isOnboardingComplete = Boolean(isOnboardingComplete);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        budgetBulanan: true,
        budgetMakanan: true,
        budgetMinuman: true,
        budgetTransportasi: true,
        budgetBelanja: true,
        budgetTagihan: true,
        budgetHiburan: true,
        budgetKesehatan: true,
        budgetLainLain: true,
        tanggalGajian: true,
        targetTabungan: true,
        isOnboardingComplete: true,
      }
    });

    res.json({
      message: 'Budget updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Error updating budget', error: error.message });
  }
};

export const getBudgetSettings = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        budgetBulanan: true,
        budgetMakanan: true,
        budgetMinuman: true,
        budgetTransportasi: true,
        budgetBelanja: true,
        budgetTagihan: true,
        budgetHiburan: true,
        budgetKesehatan: true,
        budgetLainLain: true,
        tanggalGajian: true,
        targetTabungan: true,
        isOnboardingComplete: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error getting budget settings:', error);
    res.status(500).json({ message: 'Error getting budget settings', error: error.message });
  }
};
