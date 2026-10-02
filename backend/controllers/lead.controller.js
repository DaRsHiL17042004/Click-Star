// controllers/lead.controller.js
const leadService = require('../services/lead.service');
const User = require('../models/user.model');

const LEAD_STATUSES = ['pending', 'assigned', 'completed'];

exports.createLead = async (req, res) => {
  try {
    const { clientId, photographerId } = req.body;
    const lead = await leadService.createLead({ clientId, photographerId });
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: 'Error creating lead' });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    res.status(200).json(await leadService.getAllLeads());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

exports.updateLeadStatus = async (req, res) => {
  const { leadId, status } = req.body;
  if (!LEAD_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const lead = await leadService.updateLeadStatus(leadId, status);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lead status' });
  }
};

// GET /api/admin/users — every account (passwords excluded)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 }).lean();
    res.json(users.map(({ _id, ...u }) => ({ id: _id, ...u })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};
