// backend/services/lead.service.js
// This file contains the business logic for lead management, including creating leads, fetching leads, and updating lead status.

// services/lead.service.js
const Lead = require('../models/lead.model');

// Create a lead
exports.createLead = async (data) => {
  return await Lead.create(data);
};

// Get all leads for an admin
exports.getAllLeads = async () => {
  return await Lead.find().populate('clientId photographerId');
};

// Update lead status
exports.updateLeadStatus = async (leadId, status) => {
  return await Lead.findByIdAndUpdate(leadId, { status }, { new: true });
};
