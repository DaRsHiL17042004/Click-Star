// File: routes/client.routes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const authenticate = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], clientController.login);

router.get('/:userId', authenticate, clientController.getProfileById);
router.put('/:userId', authenticate, clientController.updateProfileById);
router.get('/:userId/favorites', authenticate, clientController.getFavorites);
router.post('/:userId/favorites', authenticate, clientController.addFavorite);
router.delete('/:userId/favorites/:photographerId', authenticate, clientController.removeFavorite);

module.exports = router;