// File: backend/services/booking.service.js
// Description: This file contains the service functions for handling booking-related operations.
const Booking = require('../models/booking.model');
const allowedTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

exports.createBooking = async (bookingData) => {
  const booking = new Booking(bookingData);
  return await booking.save();
};

exports.getBookingsForPhotographer = async (photographerId) => {
  return await Booking.find({ photographerId }).populate('clientId', 'name email');
};

exports.getBookingsForClient = async (clientId) => {
  return await Booking.find({ clientId }).populate('photographerId', 'name email');
};

exports.updateBookingStatus = async (bookingId, status) => {
  return await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
};



// const booking = await Booking.findById(bookingId);
// if (!booking) throw new Error('Booking not found');
// if (!allowedTransitions[booking.status].includes(status)) {
//   throw new Error(`Cannot change status from ${booking.status} to ${status}`);
// }
// booking.status = status;
// return await booking.save();