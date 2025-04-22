// File: backend/routes/auth.routes.js
// Description: This file defines the routes for user authentication, including registration and login.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

