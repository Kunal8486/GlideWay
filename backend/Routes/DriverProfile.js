const express = require('express');
const router = express.Router();
const Driver = require('../Models/Driver');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user info in request object
    req.user = decoded;
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    
    res.status(500).json({ error: "Authentication failed" });
  }
};

/**
 * @route   GET /api/drivers/profile
 * @desc    Get current driver's profile
 * @access  Private
 */
router.get('/api/drivers/profile', authenticateToken, async (req, res) => {
  try {
    // Check if user ID exists in the token
    if (!req.user || !req.user.id) {
      return res.status(400).json({ msg: 'No driver ID provided' });
    }

    const driver = await Driver.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    return res.json(driver);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/drivers/profile
 * @desc    Update driver profile
 * @access  Private
 */
router.put('/api/drivers/profile', authenticateToken, async (req, res) => {
  try {
    // Check if user ID exists in the token
    if (!req.user || !req.user.id) {
      return res.status(400).json({ msg: 'No driver ID provided' });
    }
    
    // Fields that drivers are allowed to update
    const allowedUpdates = [
      'name', 
      'phone_number', 
      'email',
      'profile_picture_url',
      'availability'
    ];
    
    // Create profileFields object with only allowed fields
    const profileFields = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedUpdates.includes(key)) {
        profileFields[key] = value;
      }
    }

    // Special handling for location
    if (req.body.location) {
      profileFields.location = {
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude
      };
    }

    // Update driver profile
    const driver = await Driver.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    return res.json(driver);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/drivers/:driverId
 * @desc    Get driver profile by ID
 * @access  Private
 */
router.get('/api/drivers/:driverId', authenticateToken, async (req, res) => {
  try {
    // Check if driverId parameter exists
    if (!req.params.driverId) {
      return res.status(400).json({ msg: 'No driver ID provided' });
    }

    const driver = await Driver.findById(req.params.driverId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    // Check if the requesting user has permission to view this profile
    // (Admin users or the driver themselves)
    if (req.user.role !== 'admin' && req.user.id !== driver._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this profile' });
    }

    return res.json(driver);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Driver not found' });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   PUT /api/drivers/:driverId/status
 * @desc    Update driver status (admin only)
 * @access  Private/Admin
 */
router.put('/api/drivers/:driverId/status', authenticateToken, async (req, res) => {
  try {
    // Check if driverId parameter exists
    if (!req.params.driverId) {
      return res.status(400).json({ msg: 'No driver ID provided' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to perform this action' });
    }

    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.driverId,
      { 
        $set: { 
          status,
          // Automatically set is_verified to true if approved
          is_verified: status === 'approved' ? true : false 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    return res.json(driver);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET /api/drivers/:driverId/trips
 * @desc    Get driver trip history
 * @access  Private
 */
router.get('/api/drivers/:driverId/trips', authenticateToken, async (req, res) => {
  try {
    // Check if driverId parameter exists
    if (!req.params.driverId) {
      return res.status(400).json({ msg: 'No driver ID provided' });
    }
    
    const driver = await Driver.findById(req.params.driverId)
      .populate('ride_history')
      .select('ride_history');
    
    if (!driver) {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    // Check if the requesting user has permission
    if (req.user.role !== 'admin' && req.user.id !== driver._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to view this data' });
    }

    return res.json(driver.ride_history);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;