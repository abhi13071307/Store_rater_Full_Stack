// controllers/ownerController.js
const prisma = require('../prismaClient');

/**
 * GET /api/owner/stores
 * Returns stores owned by the authenticated user with average rating and total ratings.
 * Requires req.user (authMiddleware) and STORE_OWNER role (authorize).
 */
async function ownerStores(req, res) {
  try {
    const ownerId = req.user && req.user.id;
    if (!ownerId) return res.status(401).json({ error: 'Authentication required' });

    // Fetch stores owned by this user
    const stores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          select: { score: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute averages
    const result = stores.map((s) => {
      const scores = s.ratings.map((r) => r.score);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      const overallRating = avg !== null ? Math.round(avg * 10) / 10 : null;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating,
        totalRatings: scores.length,
        createdAt: s.createdAt,
      };
    });

    return res.json({ data: result });
  } catch (err) {
    console.error('ownerStores error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * GET /api/owner/stores/:id/ratings
 * Returns ratings for a store, including rater name and email.
 * Validates that the authenticated owner owns the store.
 */
async function ownerStoreRatings(req, res) {
  try {
    const ownerId = req.user && req.user.id;
    if (!ownerId) return res.status(401).json({ error: 'Authentication required' });

    const storeId = parseInt(req.params.id, 10);
    if (Number.isNaN(storeId)) return res.status(400).json({ error: 'Invalid store id' });

    // Verify store belongs to this owner
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    if (store.ownerId !== ownerId) return res.status(403).json({ error: 'Forbidden: you do not own this store' });

    // Fetch ratings with user info
    const ratings = await prisma.rating.findMany({
      where: { storeId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to a serializable shape
    const result = ratings.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment,
      createdAt: r.createdAt,
      user: r.user ? { id: r.user.id, name: r.user.name, email: r.user.email } : null,
    }));

    return res.json({ store: { id: store.id, name: store.name }, ratings: result });
  } catch (err) {
    console.error('ownerStoreRatings error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { ownerStores, ownerStoreRatings };
