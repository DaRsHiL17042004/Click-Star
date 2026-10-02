// backend/services/lead.service.js
const Lead = require('../models/lead.model');

exports.createLead = async (data) => Lead.create(data);

exports.getAllLeads = async () =>
  Lead.find()
    .populate('clientId', 'name email')
    .populate('photographerId', 'name location')
    .sort({ createdAt: -1 });

exports.updateLeadStatus = async (leadId, status) =>
  Lead.findByIdAndUpdate(leadId, { status, updatedAt: Date.now() }, { new: true, runValidators: true });
