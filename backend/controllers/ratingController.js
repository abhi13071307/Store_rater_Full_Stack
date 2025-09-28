// backend/controllers/ratingController.js
const prisma = require('../prismaClient');

/**
 * POST /api/stores/:storeId/ratings
 * Body: { score: number (1-5), comment?: string }
 * Requires authMiddleware (req.user must exist)
 */
async function addOrUpdateRating(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const storeId = parseInt(req.params.storeId, 10);
    if (Number.isNaN(storeId)) return res.status(400).json({ error: 'Invalid store id' });

    const { score, comment } = req.body;

    // Validate score
    const sc = parseInt(score, 10);
    if (Number.isNaN(sc) || sc < 1 || sc > 5) {
      return res.status(400).json({ error: 'Score must be an integer between 1 and 5' });
    }

    // Optional: validate comment length if desired
    if (comment && typeof comment === 'string' && comment.length > 1000) {
      return res.status(400).json({ error: 'Comment too long (max 1000 chars)' });
    }

    // Ensure store exists
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ error: 'Store not found' });

    // Upsert rating using unique constraint uniq_user_store
    // Prisma expects the unique compound key name as defined in schema.
    const rating = await prisma.rating.upsert({
      where: {
        uniq_user_store: {
          userId,
          storeId,
        },
      },
      update: {
        score: sc,
        comment: comment ?? null,
      },
      create: {
        score: sc,
        comment: comment ?? null,
        userId,
        storeId,
      },
    });

    // Optional: compute new average to return immediately
    const agg = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { score: true },
      _count: { score: true },
    });

    const overallAvg = agg._avg.score ? Math.round(agg._avg.score * 10) / 10 : null;
    const totalRatings = agg._count.score || 0;

    return res.json({
      message: 'Rating submitted',
      rating,
      storeSummary: { overallRating: overallAvg, totalRatings },
    });
  } catch (err) {
    console.error('addOrUpdateRating error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { addOrUpdateRating };
