// File: backend/services/auth.service.js
// Description: Password hashing and JWT helpers.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => bcrypt.hash(password, 10);
const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

const generateToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

module.exports = { hashPassword, comparePassword, generateToken };
