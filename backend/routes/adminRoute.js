// routes/adminRoute.js
const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware.js');
const { adminDashboard } = require('../controllers/adminController');

// Protect all admin routes with auth + SYSTEM_ADMIN role
router.get('/dashboard', authMiddleware, authorize('SYSTEM_ADMIN'), adminDashboard);

module.exports = router;
