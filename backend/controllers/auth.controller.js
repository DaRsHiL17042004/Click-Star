// File: backend/controllers/auth.controller.js
// Description: Controller for user authentication (registration and login) using JWT

const User = require('../models/user.model');
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed, role });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
    console.log("Logged in user:", user); // ensure user.role is present

  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
