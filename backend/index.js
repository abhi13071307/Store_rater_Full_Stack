const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());

// Use a custom log format
app.use(morgan(':method :url :status'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// index.js (snippet)
const authRouter = require('./routes/authRoute');
app.use('/api/auth', authRouter);

const { authMiddleware, authorize } = require('./middleware/authMiddleware');
const adminRoute = require('./routes/adminRoute');
app.use('/api/admin', adminRoute);

// ✅ Route accessible by any authenticated user
app.get('/api/protected', authMiddleware, (req, res) => {
  return res.json({ ok: true, message: 'You are authenticated', user: req.user });
});

// ✅ Route accessible only by SYSTEM_ADMIN
app.get('/api/admin/test', authMiddleware, authorize('SYSTEM_ADMIN'), (req, res) => {
  return res.json({ ok: true, message: 'Admin access granted', user: req.user });
});


const storeRoute = require('./routes/storeRoute');
app.use('/api/stores', storeRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
