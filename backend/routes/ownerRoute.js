// routes/ownerRoute.js
const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { ownerStores, ownerStoreRatings } = require('../controllers/ownerController');

// Protect all owner routes: must be authenticated and STORE_OWNER
router.use(authMiddleware, authorize('STORE_OWNER'));

router.get('/stores', ownerStores);
router.get('/stores/:id/ratings', ownerStoreRatings);

module.exports = router;
