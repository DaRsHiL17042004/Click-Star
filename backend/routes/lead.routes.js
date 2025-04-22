// This file defines the routes for lead management in the application.
// It includes routes for creating a lead, getting all leads, and updating lead status.

// routes/lead.routes.js
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const authenticate = require('../middlewares/auth.middleware');  // Authentication middleware

// POST - Create a lead
router.post('/lead', authenticate, leadController.createLead);

// GET - Get all leads
router.get('/leads', authenticate, leadController.getAllLeads);

// PUT - Update lead status
router.put('/lead/status', authenticate, leadController.updateLeadStatus);

module.exports = router;
