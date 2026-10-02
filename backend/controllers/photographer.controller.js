// backend/controllers/photographer.controller.js
const mongoose = require('mongoose');
const Photographer = require('../models/photographer');
const { ensurePhotographerProfile } = require('../services/profile.service');
const User = require('../models/user.model');

// Fields a photographer may edit on their own profile.
const EDITABLE = ['name', 'bio', 'location', 'specialties', 'pricing', 'phone', 'website', 'instagram', 'availability', 'portfolio', 'coverImage', 'yearsExperience'];
const pick = (body) => Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/photographer/profile — create or update the signed-in photographer's profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const profile = await Photographer.findOneAndUpdate(
      { _id: req.user.id },
      { $set: pick(req.body) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error updating/creating profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// GET /api/photographer/profile — the signed-in photographer's profile
const getProfile = async (req, res) => {
  try {
    let profile = await Photographer.findById(req.user.id);
    if (!profile) {
      // Accounts created before profiles were auto-provisioned.
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'Profile not found' });
      profile = await ensurePhotographerProfile(user);
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// GET /api/photographer/profile/:id — public profile
const getProfileById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Profile not found' });
  try {
    const profile = await Photographer.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// GET /api/photographer/search?location=&specialties=a,b
const searchphotographers = async (req, res) => {
  try {
    const { location, specialties } = req.query;
    const criteria = {};
    if (location) criteria.location = new RegExp(`^${escapeRegex(String(location).trim())}$`, 'i');
    if (specialties) criteria.specialties = { $in: String(specialties).split(',').map((s) => s.trim()).filter(Boolean) };

    const photographers = await Photographer.find(criteria).sort({ updatedAt: -1 });
    res.status(200).json(photographers);
  } catch (error) {
    console.error('Error searching photographers:', error);
    res.status(400).json({ message: error.message });
  }
};

// POST /api/photographer/upload — returns public URLs; the client saves them via /profile
const uploadPortfolio = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const base = (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const portfolioUrls = req.files.map((file) =>
    /^https?:\/\//.test(file.path) ? file.path : `${base}/uploads/${file.filename}`
  );
  res.status(200).json({ message: 'Files uploaded successfully', portfolioUrls });
};

module.exports = { createOrUpdateProfile, getProfile, getProfileById, searchphotographers, uploadPortfolio };
