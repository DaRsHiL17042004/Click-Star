// This file defines the Booking model for the application using Mongoose.
// It includes fields for client ID, photographer ID, shoot date, type, location, status, price, and notes.

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shootDate: { type: Date, required: true },
  shootType: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: { type: Number, required: true },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
