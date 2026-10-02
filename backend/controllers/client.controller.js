// File: controllers/client.controller.js
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Client = require('../models/client.model');
const Photographer = require('../models/photographer');
const { findOrCreateClient } = require('../services/profile.service');

const EDITABLE = ['name', 'email', 'phone', 'location'];
const pick = (body) => Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

const canAccess = (req) => req.user.role === 'admin' || req.user.id === req.params.userId;

// Legacy endpoint kept for backwards compatibility — prefer POST /api/auth/login.
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const client = await Client.findOne({ email: String(req.body.email).toLowerCase() }).select('+password');
    if (!client || !(await client.comparePassword(req.body.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: client.userId.toString(), email: client.email, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, client: { id: client._id, name: client.name, email: client.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
};

exports.getProfileById = async (req, res) => {
  if (!canAccess(req)) return res.status(403).json({ message: 'You can only view your own profile' });
  try {
    const client = await findOrCreateClient(req.params.userId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

exports.updateProfileById = async (req, res) => {
  if (!canAccess(req)) return res.status(403).json({ message: 'You can only edit your own profile' });
  try {
    await findOrCreateClient(req.params.userId);
    const updated = await Client.findOneAndUpdate({ userId: req.params.userId }, { $set: pick(req.body) }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Client not found' });
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'That email is already in use' });
    res.status(400).json({ message: 'Error updating profile' });
  }
};

exports.getFavorites = async (req, res) => {
  if (!canAccess(req)) return res.status(403).json({ message: 'You can only view your own favourites' });
  try {
    const client = await findOrCreateClient(req.params.userId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    await client.populate('favorites');
    res.json(client.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites' });
  }
};

exports.addFavorite = async (req, res) => {
  if (!canAccess(req)) return res.status(403).json({ message: 'You can only edit your own favourites' });
  const { photographerId } = req.body;
  try {
    if (!mongoose.isValidObjectId(photographerId) || !(await Photographer.exists({ _id: photographerId }))) {
      return res.status(404).json({ message: 'Photographer not found' });
    }
    const client = await findOrCreateClient(req.params.userId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    await Client.updateOne({ _id: client._id }, { $addToSet: { favorites: photographerId } });
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(400).json({ message: 'Error adding favorite' });
  }
};

exports.removeFavorite = async (req, res) => {
  if (!canAccess(req)) return res.status(403).json({ message: 'You can only edit your own favourites' });
  try {
    const client = await findOrCreateClient(req.params.userId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (mongoose.isValidObjectId(req.params.photographerId)) {
      await Client.updateOne({ _id: client._id }, { $pull: { favorites: req.params.photographerId } });
    }
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(400).json({ message: 'Error removing favorite' });
  }
};
