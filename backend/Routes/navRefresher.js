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

// Helper function to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '15m' // Short-lived access token
    }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      tokenType: 'refresh'
    }, 
    process.env.JWT_REFRESH_SECRET, 
    { 
      expiresIn: '7d' // Longer-lived refresh token
    }
  );
};

// Middleware to protect routes
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Export router and middleware separately
module.exports = {
  router,
  authMiddleware,
  generateAccessToken,
  generateRefreshToken
};