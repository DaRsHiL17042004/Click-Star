// routes/lead.routes.js — admin-only endpoints, mounted at /api/admin
const express = require('express');
const leadController = require('../controllers/lead.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate, requireRole('admin'));

router.post('/lead', leadController.createLead);
router.get('/leads', leadController.getAllLeads);
router.put('/lead/status', leadController.updateLeadStatus);
router.get('/users', leadController.getAllUsers);

module.exports = router;
