// File: backend/services/review.service.js
// Description: This file contains the service functions for handling reviews.


const Review = require('../models/review.model');

exports.createReview = async (reviewData) => {
  const review = new Review(reviewData);
  return await review.save();
};

exports.getReviewsByPhotographer = async (photographerId) => {
  return await Review.find({ photographerId })
    .populate('clientId', 'name') // show client name in reviews
    .sort({ createdAt: -1 }); // newest first
};

exports.getAverageRating = async (photographerId) => {
  const result = await Review.aggregate([
    { $match: { photographerId: mongoose.Types.ObjectId(photographerId) } },
    {
      $group: {
        _id: '$photographerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { averageRating: 0, totalReviews: 0 };
};
