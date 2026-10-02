// backend/app.js
const path = require('path');
const express = require('express');
const cors = require('cors');

const photographerRoutes = require('./routes/photographer.routes');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const clientRoutes = require('./routes/client.routes');
const leadRoutes = require('./routes/lead.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// CORS_ORIGIN="https://app.example.com,http://localhost:5173" — empty allows all (development)
const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : undefined));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Locally stored uploads (used when Cloudinary isn't configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

app.use('/api/auth', authRoutes);
app.use('/api/photographer', photographerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', leadRoutes);

app.get('/', (req, res) => {
  res.send('Photography Marketplace API is running!');
});

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

module.exports = app;
