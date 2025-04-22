// Description: Controller for handling review-related requests


const reviewService = require('../services/review.service');
const mongoose = require('mongoose');
exports.createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
};

exports.getReviewsByPhotographer = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByPhotographer(req.params.photographerId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};
exports.getAverageRating = async (req, res) => {
    try {
      const result = await reviewService.getAverageRating(req.params.photographerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to calculate rating', error: error.message });
    }
  };
