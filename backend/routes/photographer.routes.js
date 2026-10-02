const express = require('express');
const photographerController = require('../controllers/photographer.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');
const upload = require('../services/fileUpload.service');

const router = express.Router();
const photographerOnly = [authenticate, requireRole('photographer')];

// Create or update the signed-in photographer's profile
router.post('/profile', ...photographerOnly, photographerController.createOrUpdateProfile);

// Get the signed-in photographer's profile
router.get('/profile', ...photographerOnly, photographerController.getProfile);

// Upload portfolio images/videos (field name: "portfolio", max 10 files)
router.post('/upload', ...photographerOnly, upload.array('portfolio', 10), photographerController.uploadPortfolio);

// Public: search photographers by location / specialties
router.get('/search', photographerController.searchphotographers);

// Public: photographer profile by ID
router.get('/profile/:id', photographerController.getProfileById);

module.exports = router;
