// backend/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

const photographerRoutes = require('./routes/photographer.routes');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const clientRoutes = require('./routes/client.routes');
const leadRoutes = require('./routes/lead.routes');

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies


// Route Setup
app.use('/api/auth', authRoutes ); // Authentication routes
app.use('/api/photographer', photographerRoutes ); // Photographer routes
app.use('/api/reviews', reviewRoutes );
app.use('/api/bookings', bookingRoutes);
app.use('/api/client', clientRoutes); // Client routes
app.use('/api/admin', leadRoutes);  // Prefix for admin routes

app.get('/', (req, res) => {
  res.send('Photography Marketplace API is running!');
});

module.exports = app;
