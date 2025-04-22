// controllers/lead.controller.js
// This file contains the controller functions for handling lead-related requests.

// controllers/lead.controller.js
const leadService = require('../services/lead.service');
const { body, validationResult } = require('express-validator');

// Create a lead
exports.createLead = async (req, res) => {
  try {
    const lead = await leadService.createLead(req.body);
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: 'Error creating lead', error });
  }
};

// Get all leads
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await leadService.getAllLeads();
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads', error });
  }
};

// Update lead status
exports.updateLeadStatus = async (req, res) => {
  const { leadId, status } = req.body;
  try {
    const lead = await leadService.updateLeadStatus(leadId, status);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lead status', error });
  }
};


