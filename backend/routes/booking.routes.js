// backend/routes/booking.routes.js
const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

// Client creates a booking
router.post('/', requireRole('client'), bookingController.createBooking);

// Photographer (or admin) lists their bookings
router.get('/photographer/:photographerId', bookingController.getPhotographerBookings);

// Client (or admin) lists their bookings
router.get('/client/:clientId', bookingController.getClientBookings);

// Update booking status (confirm / complete / cancel) — rules in booking.service
router.patch('/:bookingId/status', bookingController.updateBookingStatus);

module.exports = router;
