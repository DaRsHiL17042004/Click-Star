// backend/controllers/booking.controller.js
const mongoose = require('mongoose');
const bookingService = require('../services/booking.service');
const Photographer = require('../models/photographer');

const fail = (res, err, fallback) =>
  res.status(err.status || 500).json({ message: err.status ? err.message : fallback });

// POST /api/bookings — the client is always the signed-in user
exports.createBooking = async (req, res) => {
  try {
    const { photographerId, shootDate, shootType, location, price, notes } = req.body;
    if (!mongoose.isValidObjectId(photographerId)) return res.status(400).json({ message: 'Invalid photographer' });
    if (!(await Photographer.exists({ _id: photographerId }))) return res.status(404).json({ message: 'Photographer not found' });

    const date = new Date(shootDate);
    if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid shoot date' });
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (date < startOfToday) return res.status(400).json({ message: 'Shoot date must be today or later' });
    if (!shootType || !location) return res.status(400).json({ message: 'Shoot type and location are required' });
    if (!(Number(price) >= 0)) return res.status(400).json({ message: 'Invalid price' });

    const booking = await bookingService.createBooking({
      clientId: req.user.id,
      photographerId,
      shootDate: date,
      shootType,
      location,
      price: Number(price),
      notes,
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    fail(res, err, 'Error creating booking');
  }
};

// GET /api/bookings/photographer/:photographerId
exports.getPhotographerBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.photographerId) {
      return res.status(403).json({ message: 'You can only view your own bookings' });
    }
    res.json(await bookingService.getBookingsForPhotographer(req.params.photographerId));
  } catch (err) {
    fail(res, err, 'Error fetching bookings');
  }
};

// GET /api/bookings/client/:clientId
exports.getClientBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.clientId) {
      return res.status(403).json({ message: 'You can only view your own bookings' });
    }
    res.json(await bookingService.getBookingsForClient(req.params.clientId));
  } catch (err) {
    fail(res, err, 'Error fetching bookings');
  }
};

// PATCH /api/bookings/:bookingId/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const updated = await bookingService.updateBookingStatus(req.params.bookingId, req.body.status, req.user);
    res.json(updated);
  } catch (err) {
    fail(res, err, 'Error updating booking status');
  }
};
