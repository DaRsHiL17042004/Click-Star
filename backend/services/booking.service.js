// File: backend/services/booking.service.js
// Description: Booking persistence and status rules.
const Booking = require('../models/booking.model');

const allowedTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

exports.createBooking = async (bookingData) => new Booking(bookingData).save();

exports.getBookingsForPhotographer = async (photographerId) =>
  Booking.find({ photographerId }).populate('clientId', 'name email').sort({ shootDate: 1 });

exports.getBookingsForClient = async (clientId) =>
  Booking.find({ clientId }).populate('photographerId', 'name email').sort({ shootDate: 1 });

/**
 * Photographers confirm / complete / cancel their bookings; clients may only cancel their own.
 * Admins can do anything allowed by the status machine.
 */
exports.updateBookingStatus = async (bookingId, status, user) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw httpError(404, 'Booking not found');

  const isPhotographer = booking.photographerId.toString() === user.id;
  const isClient = booking.clientId.toString() === user.id;
  const isAdmin = user.role === 'admin';
  if (!isPhotographer && !isClient && !isAdmin) throw httpError(403, 'You do not have access to this booking');
  if (isClient && !isPhotographer && !isAdmin && status !== 'cancelled') {
    throw httpError(403, 'Clients can only cancel a booking');
  }
  if (!allowedTransitions[booking.status]?.includes(status)) {
    throw httpError(400, `Cannot change status from ${booking.status} to ${status}`);
  }

  booking.status = status;
  return booking.save();
};

exports.allowedTransitions = allowedTransitions;
