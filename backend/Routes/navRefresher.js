const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Models/Rider');

const router = express.Router();

// Token refresh route
router.post('/refresh-token', async (req, res) => {
  try {
    // Get the current token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const currentToken = authHeader.split(' ')[1];

    // Verify the current token (without checking expiration)
    let decoded;
    try {
      decoded = jwt.verify(currentToken, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (verifyError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newToken = generateAccessToken(user);

    // Optional: Generate new refresh token if needed
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken, // Optional
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error during token refresh' });
  }
});

module.exports = router;