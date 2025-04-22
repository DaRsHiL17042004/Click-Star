const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' } // Optional: link review to booking
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
