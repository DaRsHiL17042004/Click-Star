// File: backend/services/auth.service.js
// Description: This file contains the authentication service functions for user registration, login, and token generation. 

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => await bcrypt.hash(password, 10);
const comparePassword = async (plain, hash) => await bcrypt.compare(plain, hash);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { hashPassword, comparePassword, generateToken };
