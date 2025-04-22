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
}, { timestamps: true });

const photographer = mongoose.model('Photographer', photographerSchema);

module.exports = photographer;
