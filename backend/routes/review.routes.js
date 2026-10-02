// backend/routes/review.routes.js
const express = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/reviews — signed-in clients only
router.post('/', authenticate, requireRole('client'), reviewController.createReview);

// GET /api/reviews/:photographerId/rating — average rating (public)
router.get('/:photographerId/rating', reviewController.getAverageRating);

// GET /api/reviews/:photographerId — reviews for a photographer (public)
router.get('/:photographerId', reviewController.getReviewsByPhotographer);

module.exports = router;
