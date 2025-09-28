// backend/routes/adminRoute.js
const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const {
  adminDashboard,
  listUsers,
  createUser,
  createStore,
  listStores,
  getUserDetails,
} = require('../controllers/adminController');

router.use(authMiddleware, authorize('SYSTEM_ADMIN'));

// Dashboard
router.get('/dashboard', adminDashboard);

// Users
router.get('/users', listUsers);           // list + filters
router.post('/users', createUser);         // create user
router.get('/users/:id', getUserDetails);  // user details

// Stores
router.get('/stores', listStores);         // list stores (with rating)
router.post('/stores', createStore);       // create store

module.exports = router;
