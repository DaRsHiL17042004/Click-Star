// File: backend/services/review.service.js
// Description: Review persistence and rating aggregation.
const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Booking = require('../models/booking.model');

const httpError = (status, message) => Object.assign(new Error(message), { status });

exports.createReview = async ({ clientId, photographerId, rating, comment, bookingId }) => {
  if (!mongoose.isValidObjectId(photographerId)) throw httpError(400, 'Invalid photographer');
  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) throw httpError(400, 'Rating must be between 1 and 5');

  if (bookingId) {
    if (!mongoose.isValidObjectId(bookingId)) throw httpError(400, 'Invalid booking');
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.clientId.toString() !== clientId || booking.photographerId.toString() !== photographerId) {
      throw httpError(403, 'You can only review your own bookings');
    }
    if (booking.status !== 'completed') throw httpError(400, 'You can review a booking once it is completed');
    if (await Review.exists({ bookingId })) throw httpError(409, 'You have already reviewed this booking');
  }

  return new Review({ clientId, photographerId, rating: score, comment, bookingId }).save();
};

exports.getReviewsByPhotographer = async (photographerId) =>
  Review.find({ photographerId })
    .populate('clientId', 'name') // show client name in reviews
    .sort({ createdAt: -1 }); // newest first

exports.getAverageRating = async (photographerId) => {
  if (!mongoose.isValidObjectId(photographerId)) throw httpError(400, 'Invalid photographer');
  const [result] = await Review.aggregate([
    { $match: { photographerId: new mongoose.Types.ObjectId(photographerId) } },
    { $group: { _id: '$photographerId', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ]);
  return result
    ? { averageRating: Math.round(result.averageRating * 10) / 10, totalReviews: result.totalReviews }
    : { averageRating: 0, totalReviews: 0 };
};
