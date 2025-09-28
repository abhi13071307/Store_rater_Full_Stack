// backend/controllers/adminController.js
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

/* --- existing adminDashboard (kept) --- */
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

/* --- existing listUsers (kept) --- */
async function listUsers(req, res) {
  try {
    const { search = '', role, sortBy = 'name', order = 'asc', page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const allowedSort = ['name', 'email', 'address', 'role', 'createdAt'];
    const orderByField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const orderDirection = order === 'desc' ? 'desc' : 'asc';

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      orderBy: { [orderByField]: orderDirection },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });

    return res.json({ page: pageNum, limit: pageSize, total, data: users });
  } catch (err) {
    console.error('listUsers error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* --- createUser (kept) --- */
async function createUser(req, res) {
  try {
    const { name, email, address = null, password, role = 'NORMAL_USER' } = req.body;

    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: 'Name must be 20-60 characters.' });
    }
    if (address && address.length > 400) {
      return res.status(400).json({ error: 'Address must be <= 400 chars.' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!password || !pwRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be 8-16 chars, include at least one uppercase and one special character.',
      });
    }

    const allowedRoles = ['SYSTEM_ADMIN', 'STORE_OWNER', 'NORMAL_USER'];
    const finalRole = allowedRoles.includes(role) ? role : 'NORMAL_USER';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, address, password: hashed, role: finalRole },
      select: { id: true, name: true, email: true, role: true, address: true },
    });

    return res.status(201).json({ message: 'User created', user });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* --- NEW: createStore --- */
async function createStore(req, res) {
  try {
    const { name, email = null, address = null, ownerId = null } = req.body;
    if (!name || name.trim().length === 0) return res.status(400).json({ error: 'Store name required' });
    if (address && address.length > 400) return res.status(400).json({ error: 'Address too long' });

    // optional ownerId: validate if provided
    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner) return res.status(400).json({ error: 'Owner user not found' });
    }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId: ownerId || null },
    });

    return res.status(201).json({ message: 'Store created', store });
  } catch (err) {
    console.error('createStore error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* --- NEW: listStores (admin view) --- */
async function listStores(req, res) {
  try {
    const { search = '', address = '', sortBy = 'name', order = 'asc', page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const allowedSort = ['name', 'email', 'address', 'createdAt'];
    const orderByField = allowedSort.includes(sortBy) ? sortBy : 'name';
    const orderDirection = order === 'desc' ? 'desc' : 'asc';

    const where = { AND: [] };
    if (search) where.AND.push({ name: { contains: search, mode: 'insensitive' } });
    if (address) where.AND.push({ address: { contains: address, mode: 'insensitive' } });
    if (where.AND.length === 0) delete where.AND;

    const total = await prisma.store.count({ where });

    // include ratings for average calculation + owner info
    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: { select: { score: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { [orderByField]: orderDirection },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    const data = stores.map(s => {
      const scores = s.ratings.map(r => r.score);
      const avg = scores.length ? Math.round((scores.reduce((a,b)=>a+b,0)/scores.length) * 10) / 10 : null;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner: s.owner,
        overallRating: avg,
        totalRatings: scores.length,
        createdAt: s.createdAt,
      };
    });

    return res.json({ page: pageNum, limit: pageSize, total, data });
  } catch (err) {
    console.error('listStores error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* --- NEW: getUserDetails (shows rating if store owner) --- */
async function getUserDetails(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) return res.status(400).json({ error: 'Invalid user id' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // if store owner, include their store rating(s) (average per store)
    let ownerData = null;
    if (user.role === 'STORE_OWNER') {
      const stores = await prisma.store.findMany({
        where: { ownerId: userId },
        include: { ratings: { select: { score: true } } },
      });
      ownerData = stores.map(s => {
        const scores = s.ratings.map(r => r.score);
        const avg = scores.length ? Math.round((scores.reduce((a,b)=>a+b,0)/scores.length) * 10) / 10 : null;
        return { id: s.id, name: s.name, overallRating: avg, totalRatings: scores.length };
      });
    }

    return res.json({ user, ownerData });
  } catch (err) {
    console.error('getUserDetails error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  adminDashboard,
  listUsers,
  createUser,
  createStore,
  listStores,
  getUserDetails,
};
