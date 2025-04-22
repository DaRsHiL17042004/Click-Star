// This file contains the controller functions for handling booking-related requests.
// It interacts with the booking service to perform CRUD operations on bookings.


const bookingService = require('../services/booking.service');

exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error creating booking', error: err.message });
  }
};

exports.getPhotographerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsForPhotographer(req.params.photographerId);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
};

exports.getClientBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsForClient(req.params.clientId);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const updated = await bookingService.updateBookingStatus(req.params.bookingId, req.body.status);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking status', error: err.message });
  }
};
