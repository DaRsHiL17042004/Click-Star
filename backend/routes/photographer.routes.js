const express = require('express');
const photographerController = require('../controllers/photographer.controller');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../services/fileUpload.service');
const router = express.Router();

// Route to create or update photographer's profile
router.post('/profile', authenticate, photographerController.createOrUpdateProfile);

// Route to get photographer's profile
router.get('/profile', authenticate, photographerController.getProfile);

// Route to upload portfolio images/videos
router.post('/upload', authenticate, upload.array('portfolio', 10), photographerController.uploadPortfolio);

// Search photographers based on some criteria (location, specialties, etc.)
router.get('/search', photographerController.searchphotographers);

// Get photographer's profile by ID
router.get('/profile/:id', photographerController.getProfileById);

module.exports = router;
