// File: backend/controllers/auth.controller.js
// Description: Controller for user authentication (registration and login) using JWT

const User = require('../models/user.model');
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');
const { createProfileFor } = require('../services/profile.service');

const PUBLIC_ROLES = ['client', 'photographer'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toPublic = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

exports.register = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = req.body.role || 'client';

    if (name.length < 2) return res.status(400).json({ message: 'Name is required' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    // Admin accounts can't be self-registered — use `npm run create-admin`.
    if (!PUBLIC_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid account type' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed, role });
    await createProfileFor(user);

    res.status(201).json({ token: generateToken(user), user: toPublic(user) });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email });
    const isMatch = user ? await comparePassword(password, user.password) : false;
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    res.json({ token: generateToken(user), user: toPublic(user) });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};
