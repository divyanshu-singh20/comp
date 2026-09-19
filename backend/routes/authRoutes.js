const express = require('express');
const { login, register } = require('../controllers/authController');

const router = express.Router();

// Authentication endpoints are public; successful login returns the Bearer token.
router.post('/register', register);
router.post('/login', login);

module.exports = router;
