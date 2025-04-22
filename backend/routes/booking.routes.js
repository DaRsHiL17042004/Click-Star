// This file defines the routes for booking-related operations in the application.
// It includes routes for creating bookings, retrieving bookings for photographers and clients,

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// Client creates a booking
router.post('/', bookingController.createBooking);

// Photographer gets all bookings
router.get('/photographer/:photographerId', bookingController.getPhotographerBookings);

// Client gets their own bookings
router.get('/client/:clientId', bookingController.getClientBookings);

// Update booking status (confirm/cancel/complete)
router.patch('/:bookingId/status', bookingController.updateBookingStatus);

module.exports = router;

