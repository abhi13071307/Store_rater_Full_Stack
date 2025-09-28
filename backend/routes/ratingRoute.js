// backend/routes/ratingRoute.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { addOrUpdateRating } = require('../controllers/ratingController');

// Submit or update rating for a store (authenticated)
router.post('/:storeId', authMiddleware, addOrUpdateRating);

module.exports = router;
