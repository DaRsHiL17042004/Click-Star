// backend/services/profile.service.js
// Keeps role-specific profile documents in sync with User accounts.
const Client = require('../models/client.model');
const Photographer = require('../models/photographer');
const User = require('../models/user.model');

/** Photographer profiles share their _id with the owning User. */
exports.ensurePhotographerProfile = async (user) =>
  Photographer.findOneAndUpdate(
    { _id: user._id },
    { $setOnInsert: { _id: user._id, name: user.name, specialties: [], availability: [], portfolio: [] } },
    { new: true, upsert: true }
  );

exports.ensureClientProfile = async (user) =>
  Client.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id, name: user.name, email: user.email, favorites: [] } },
    { new: true, upsert: true }
  );

/** Creates the matching profile for a freshly registered user. */
exports.createProfileFor = async (user) => {
  if (user.role === 'photographer') return exports.ensurePhotographerProfile(user);
  if (user.role === 'client') return exports.ensureClientProfile(user);
  return null;
};

/** Finds a client profile, creating it for legacy accounts registered before profiles existed. */
exports.findOrCreateClient = async (userId) => {
  const existing = await Client.findOne({ userId });
  if (existing) return existing;
  const user = await User.findById(userId);
  if (!user || user.role !== 'client') return null;
  return exports.ensureClientProfile(user);
};
