// backend/routes/storeRoute.js
const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { listStores, getStore } = require('../controllers/storeController');

// public list, but optionalAuth picks up logged-in user's rating if present
router.get('/', optionalAuth, listStores);
router.get('/:id', getStore);

module.exports = router;
