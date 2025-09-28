// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'verysecure_dev_secret';
const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

async function register(req, res) {
  try {
    const { name, email, address = null, password, role } = req.body;

    // Name validation
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: 'Name must be 20-60 characters.' });
    }
    // Address validation
    if (address && address.length > 400) {
      return res.status(400).json({ error: 'Address must be <= 400 chars.' });
    }
    // Email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    // Password validation
    if (!password || !pwRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be 8-16 chars, include at least one uppercase and one special character.',
      });
    }

    // Allowed roles
    const allowedRoles = ['NORMAL_USER', 'STORE_OWNER', 'SYSTEM_ADMIN'];
    const finalRole = allowedRoles.includes(role) ? role : 'NORMAL_USER';

    // Ensure unique email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        password: hashed,
        role: finalRole,
      },
      select: { id: true, name: true, email: true, role: true, address: true },
    });

    // Auto-sign in: return token + user
    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '8h',
    });

    return res.status(201).json({ message: 'User created', user, token });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '8h',
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login };
