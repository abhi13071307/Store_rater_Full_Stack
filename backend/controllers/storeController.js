// backend/controllers/storeController.js
const prisma = require('../prismaClient');

/**
 * GET /api/stores
 * Supports search (name), address, pagination, sortBy, order.
 * If req.user exists, include user's submitted rating for each store (userRating).
 */
async function listStores(req, res) {
  try {
    const { search = '', address = '', page = 1, limit = 10, sortBy = 'name', order = 'asc' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const allowedSort = ['name', 'email', 'createdAt'];
    const orderByField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const orderDirection = order === 'desc' ? 'desc' : 'asc';

    // fetch stores with their ratings (small dataset approach)
    const stores = await prisma.store.findMany({
      where: {
        AND: [
          search ? { name: { contains: search, mode: 'insensitive' } } : {},
          address ? { address: { contains: address, mode: 'insensitive' } } : {},
        ],
      },
      include: {
        ratings: { select: { score: true, userId: true } },
      },
      orderBy: { [orderByField]: orderDirection },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    const userId = req.user ? req.user.id : null;

    const data = stores.map((s) => {
      const scores = s.ratings.map((r) => r.score);
      const overall = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const overallRating = overall !== null ? Math.round(overall * 10) / 10 : null;
      const userRatingObj = userId ? s.ratings.find((r) => r.userId === userId) : null;
      const userRating = userRatingObj ? userRatingObj.score : null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating,
        userRating,
      };
    });

    return res.json({ page: pageNum, limit: pageSize, data });
  } catch (err) {
    console.error('listStores error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * GET /api/stores/:id
 * Return store details and ratings list (no optionalAuth here; public).
 */
async function getStore(req, res) {
  try {
    const storeId = parseInt(req.params.id, 10);
    if (Number.isNaN(storeId)) return res.status(400).json({ error: 'Invalid store id' });

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        ratings: {
          select: { id: true, score: true, comment: true, userId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) return res.status(404).json({ error: 'Store not found' });

    const scores = store.ratings.map((r) => r.score);
    const overall = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const overallRating = overall !== null ? Math.round(overall * 10) / 10 : null;

    return res.json({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      overallRating,
      ratings: store.ratings,
    });
  } catch (err) {
    console.error('getStore error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { listStores, getStore };
