// File: backend/routes/review.routes.js
// Description: Routes for handling reviews of photographers

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

// POST /api/reviews - Create a new review
router.post('/', reviewController.createReview);

// GET /api/reviews/:photographerId - Get reviews for a photographer
router.get('/:photographerId', reviewController.getReviewsByPhotographer);

// GET /api/reviews/:photographerId/rating - Get average rating of a photographer
router.get('/:photographerId/rating', reviewController.getAverageRating);

module.exports = router;
