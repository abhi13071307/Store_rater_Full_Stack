// controllers/adminController.js
const prisma = require('../prismaClient');

// Admin dashboard: totals for users, stores, ratings
async function adminDashboard(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { adminDashboard };
