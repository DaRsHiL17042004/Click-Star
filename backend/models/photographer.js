const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  hourly: { type: Number, default: 0 },
  event: { type: Number, default: 0 },
  package: { type: Number, default: 0 },
});

const photographerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  location: { type: String },
  specialties: [{ type: String }], // array of specialties
  pricing: pricingSchema,          // nested object
  phone: { type: String },
  website: { type: String },
  instagram: { type: String },
  availability: [{ type: String }], // array of dates/slots
  portfolio: [{ type: String }],    // image/video URLs
  coverImage: { type: String },
  yearsExperience: { type: Number, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Photographer', photographerSchema);
