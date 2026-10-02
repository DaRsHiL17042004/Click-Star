// backend/controllers/review.controller.js
const reviewService = require('../services/review.service');

const fail = (res, err, fallback) =>
  res.status(err.status || 500).json({ message: err.status ? err.message : fallback });

// POST /api/reviews — the reviewer is always the signed-in client
exports.createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview({ ...req.body, clientId: req.user.id });
    res.status(201).json(review);
  } catch (err) {
    fail(res, err, 'Failed to create review');
  }
};

exports.getReviewsByPhotographer = async (req, res) => {
  try {
    res.json(await reviewService.getReviewsByPhotographer(req.params.photographerId));
  } catch (err) {
    fail(res, err, 'Failed to fetch reviews');
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    res.json(await reviewService.getAverageRating(req.params.photographerId));
  } catch (err) {
    fail(res, err, 'Failed to calculate rating');
  }
};
