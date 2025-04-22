// This file defines the Lead model for the application using Mongoose.
// It includes fields for client ID, photographer ID, status, and timestamps.

// models/lead.model.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Client',  // Refers to the client who requested the photographer
  },
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Photographer',  // Refers to the assigned photographer
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending',  // Lead status
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lead', leadSchema);
