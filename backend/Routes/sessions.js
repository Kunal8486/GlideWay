const express = require('express');
const router = express.Router();
const authController = require('../Controllers/Sessions');

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

// Example of a protected route
router.get('/protected', authController.validateSession, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.userId });
});

module.exports = router;
