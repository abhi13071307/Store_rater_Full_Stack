// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

// password regex per your rule: 8-16 chars, at least one uppercase, one special char
const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

// Register (normal user)
async function register(req, res) {
  try {
    const { name, email, address, password } = req.body;

    // Basic validations
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: 'Name must be 20-60 characters.' });
    }
    if (address && address.length > 400) {
      return res.status(400).json({ error: 'Address must be <= 400 chars.' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    if (!password || !pwRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be 8-16 chars, include at least one uppercase and one special character.',
      });
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        address,
        role: 'NORMAL_USER',
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return res.status(201).json({ message: 'User created', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '8h',
    });

    // send minimal user info + token (do not send password)
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login };
