// File: services/client.service.js
const Client = require("../models/client.model");
const bcrypt = require("bcrypt");

exports.createClientProfile = async (data) => {
  return await Client.create(data);
};

exports.getClientProfile = async (userId) => {
  return await Client.findOne({ userId });
};

exports.updateClientProfile = async (userId, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return await Client.findOneAndUpdate({ userId }, data, { new: true });
};

exports.getFavorites = async (userId) => {
  const client = await Client.findOne({ userId }).populate("favorites");
  return client?.favorites || [];
};

exports.addFavorite = async (userId, photographerId) => {
  const client = await Client.findOne({ userId });
  if (!client) return null;

  if (!client.favorites.includes(photographerId)) {
    client.favorites.push(photographerId);
    await client.save();
  }

  return client.favorites;
};

exports.removeFavorite = async (userId, photographerId) => {
  const client = await Client.findOne({ userId });
  if (!client) return null;

  client.favorites = client.favorites.filter(id => id.toString() !== photographerId);
  await client.save();

  return client.favorites;
};
