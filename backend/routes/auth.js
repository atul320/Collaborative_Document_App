const express = require('express');
const router = express.Router();
const { register, login, logout, checkAuth } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/check', authenticate, checkAuth);

module.exports = router;