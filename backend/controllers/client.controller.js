
// File: controllers/client.controller.js
const Client = require('../models/client.model');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const client = await Client.findOne({ email });
    if (!client) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await client.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ clientId: client._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, client: { id: client._id, name: client.name, email: client.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
};

exports.getProfileById = async (req, res) => {
  const { userId } = req.params;
  try {
    const client = await Client.findOne({ userId });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

exports.updateProfileById = async (req, res) => {
  const { userId } = req.params;
  try {
    const updatedClient = await Client.findOneAndUpdate({ userId }, req.body, { new: true });
    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error });
  }
};

exports.getFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    const client = await Client.findOne({ userId }).populate('favorites');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error });
  }
};

exports.addFavorite = async (req, res) => {
  const { userId } = req.params;
  const { photographerId } = req.body;
  try {
    const client = await Client.findOne({ userId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (!client.favorites.includes(photographerId)) {
      client.favorites.push(photographerId);
      await client.save();
    }
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(400).json({ message: 'Error adding favorite', error });
  }
};

exports.removeFavorite = async (req, res) => {
  const { userId, photographerId } = req.params;
  try {
    const client = await Client.findOne({ userId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    client.favorites = client.favorites.filter(id => id.toString() !== photographerId);
    await client.save();

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(400).json({ message: 'Error removing favorite', error });
  }
};
