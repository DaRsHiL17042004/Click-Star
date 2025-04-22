const photographer = require('../models/photographer.js');

// Create or update the photographer's profile
const createOrUpdateProfile = async (req, res) => {
  const { id } = req.user; // Assuming user ID is in the authentication middleware (JWT or session)
  const profileData = req.body;

  try {
    // If a profile exists, update it; if not, create a new one
    const photographer = await photographer.findOneAndUpdate(
      { _id: id }, // Assuming the photographer is identified by user ID (from session or JWT)
      profileData,
      { new: true, upsert: true } // This will create a new profile if none exists
    );

    res.status(200).json(photographer);
  } catch (error) {
    console.error('Error updating/creating profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get the photographer's profile
const getProfile = async (req, res) => {
  const { id } = req.user;

  try {
    const photographer = await photographer.findOne({ _id: id });
    if (!photographer) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(photographer);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get photographer's profile by ID
const getProfileById = async (req, res) => {
  const { id } = req.params;

  try {
    const photographer = await photographer.findById(id);
    if (!photographer) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(photographer);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// Search photographers based on query params (e.g., specialties, location)
const searchphotographers = async (req, res) => {
  const { location, specialties } = req.query;

  try {
    let searchCriteria = {};

    if (location) searchCriteria.location = location;
    if (specialties) searchCriteria.specialties = { $in: specialties.split(',') }; // specialties is an array

    const photographers = await photographer.find(searchCriteria);
    res.status(200).json(photographers);
  } catch (error) {
    console.error('Error searching photographers:', error);
    res.status(400).json({ message: error.message });
  }
};

// Handle uploading portfolio images/videos (e.g., storing in cloud or file system)
const uploadPortfolio = (req, res) => {
  // Assuming `upload` middleware processes the file upload
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const portfolioUrls = req.files.map(file => file.path); // Assuming the uploaded file has a `path` property
    res.status(200).json({ message: 'Files uploaded successfully', portfolioUrls });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
  getProfileById,
  searchphotographers,
  uploadPortfolio
};
