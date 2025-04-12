const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const dotenv = require("dotenv");
const Rider = require("../Models/Rider.js");
const Ride = require("../Models/Ride.js"); // Assuming a Ride model exists
const axios = require("axios");

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Forbidden: Invalid token" });
    req.user = decoded;
    next();
  });
};

// 📌 Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone_number, password, gender, dob } = req.body;
    if (await Rider.findOne({ email })) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newRider = new Rider({ name, email, phone_number, password: hashedPassword, gender, dob });
    await newRider.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Verify reCAPTCHA token
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const recaptchaResponse = await axios.post(recaptchaVerifyUrl, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY || "6Le-vAArAAAAAINVH521Vd5qDFNlDu3NMR2-t-eu",
        response: captchaToken
      }
    });

    // Check if reCAPTCHA verification failed
    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ 
        error: "reCAPTCHA verification failed. Please try again." 
      });
    }

    // Find rider by email
    const rider = await Rider.findOne({ email });

    // Check credentials
    if (!rider || !(await bcrypt.compare(password, rider.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: rider._id.toString(),
        email: rider.email
      }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );

    // Optional: Add additional security logging
    console.log(`Successful login attempt for email: ${email}`);

    // Send successful response
    res.json({ 
      message: "Logged in successfully", 
      token,
      userId: rider._id.toString()
    });

  } catch (error) {
    console.error("Login error:", error);
    
    // Differentiate between different types of errors
    if (error.response) {
      // reCAPTCHA verification error
      return res.status(500).json({ error: "reCAPTCHA verification failed" });
    }

    // Generic server error
    res.status(500).json({ error: "Server error during login" });
  }
});

// 📌 Google Auth Route
router.post("/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const { sub: googleId, name, email, picture } = ticket.getPayload();

    let rider = await Rider.findOne({ email });
    if (!rider) {
      rider = new Rider({
        name,
        email,
        phone_number: "",
        googleId,
        password: "",
        gender: "",
        dob: "",
        profile_picture_url: picture,
        is_verified: true,
      });
      await rider.save();
    }

    const jwtToken = jwt.sign({ id: rider._id.toString() }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Logged in successfully", token: jwtToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Google login failed" });
  }
});

// 📌 Logout Route
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" }); 
});

// 📌 Profile Routes
// Get rider profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Make sure we have a valid user ID from the token
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const rider = await Rider.findById(req.user.id)
      .populate('ride_history')
      .select('-password');
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    res.json(rider);
  } catch (err) {
    console.error('Profile fetch error:', err);
    
    // More specific error handling
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Update rider profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // Make sure we have a valid user ID from the token
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    const {
      name,
      phone_number,
      gender,
      dob,
      preferred_payment,
      home_location,
      work_location
    } = req.body;

    // Build rider object with validation
    const riderFields = {};
    if (name) riderFields.name = name;
    if (phone_number) riderFields.phone_number = phone_number;
    if (gender) riderFields.gender = gender;
    
    // Validate date format before processing
    if (dob) {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for date of birth' });
      }
      
      riderFields.dob = birthDate;
      
      // Calculate age if dob is provided
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      riderFields.age = age;
    }
    
    // Validate payment type
    if (preferred_payment) {
      if (!['card', 'wallet', 'cash'].includes(preferred_payment)) {
        return res.status(400).json({ error: 'Invalid payment preference' });
      }
      riderFields.preferred_payment = preferred_payment;
    }
    
    // Validate location data
    if (home_location) {
      if (home_location.latitude === undefined || home_location.longitude === undefined) {
        return res.status(400).json({ error: 'Home location must include both latitude and longitude' });
      }
      riderFields.home_location = home_location;
    }
    
    if (work_location) {
      if (work_location.latitude === undefined || work_location.longitude === undefined) {
        return res.status(400).json({ error: 'Work location must include both latitude and longitude' });
      }
      riderFields.work_location = work_location;
    }

    let rider = await Rider.findById(req.user.id);

    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Update with proper error handling
    rider = await Rider.findByIdAndUpdate(
      req.user.id,
      { $set: riderFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', rider });
  } catch (err) {
    console.error('Profile update error:', err);
    
    // More specific error handling
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: err.message });
    }
    
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// 📌 Change Password Route
router.put('/profile/password', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Find the rider
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // If rider uses social login and has no password set
    if (!rider.password && rider.googleId) {
      return res.status(400).json({ 
        error: 'Your account uses Google authentication. Please set up a password first.' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, rider.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    rider.password = hashedPassword;
    await rider.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Server error while updating password' });
  }
});

// 📌 Wallet Routes
// Get wallet balance
router.get('/wallet', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const rider = await Rider.findById(req.user.id).select('wallet_balance');
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    res.json({ balance: rider.wallet_balance || 0 });
  } catch (err) {
    console.error('Wallet balance fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching wallet balance' });
  }
});

// Add funds to wallet
router.post('/wallet/deposit', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const { amount, paymentMethod, transactionId } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Find the rider
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Update wallet balance
    rider.wallet_balance = (rider.wallet_balance || 0) + parseFloat(amount);
    
    // Add transaction record (if you have a transactions collection)
    const transaction = {
      amount: parseFloat(amount),
      type: 'deposit',
      payment_method: paymentMethod,
      transaction_id: transactionId,
      timestamp: new Date()
    };

    // Assuming you have a wallet_transactions array in your rider model
    if (!rider.wallet_transactions) {
      rider.wallet_transactions = [];
    }
    rider.wallet_transactions.push(transaction);

    await rider.save();

    res.json({ 
      message: 'Funds added successfully', 
      newBalance: rider.wallet_balance,
      transaction 
    });
  } catch (err) {
    console.error('Wallet deposit error:', err);
    res.status(500).json({ error: 'Server error while processing deposit' });
  }
});

// 📌 Ride History Routes
// Get all rides for a rider
router.get('/rides', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get rider to check if they exist
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Get rides directly from Ride model instead of through populated field
    const rides = await Ride.find({ rider: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('driver', 'name rating vehicle_details');
    
    // Get total count for pagination
    const total = await Ride.countDocuments({ rider: req.user.id });
    
    res.json({
      rides,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    console.error('Ride history fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching ride history' });
  }
});

// Get details for a specific ride
router.get('/rides/:rideId', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const ride = await Ride.findOne({
      _id: req.params.rideId,
      rider: req.user.id
    }).populate('driver', 'name phone_number rating vehicle_details');

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json(ride);
  } catch (err) {
    console.error('Ride details fetch error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid ride ID format' });
    }
    
    res.status(500).json({ error: 'Server error while fetching ride details' });
  }
});

// 📌 Location Routes
// Update saved locations
router.put('/locations', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const { type, location } = req.body; // type can be 'home', 'work', or any other label

    // Validate input
    if (!type || !location) {
      return res.status(400).json({ error: 'Type and location are required' });
    }

    if (location.latitude === undefined || location.longitude === undefined) {
      return res.status(400).json({ error: 'Location must include both latitude and longitude' });
    }

    // Find the rider
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Update the requested location type
    if (type === 'home') {
      rider.home_location = location;
    } else if (type === 'work') {
      rider.work_location = location;
    } else {
      // Handle custom saved locations if your model supports it
      if (!rider.saved_locations) {
        rider.saved_locations = {};
      }
      rider.saved_locations[type] = location;
    }

    await rider.save();

    res.json({ 
      message: `${type} location updated successfully`, 
      location 
    });
  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ error: 'Server error while updating location' });
  }
});

// Delete saved location
router.delete('/locations/:type', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const locationType = req.params.type;
    
    // Find the rider
    const rider = await Rider.findById(req.user.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Remove the specified location
    if (locationType === 'home') {
      rider.home_location = undefined;
    } else if (locationType === 'work') {
      rider.work_location = undefined;
    } else if (rider.saved_locations && rider.saved_locations[locationType]) {
      delete rider.saved_locations[locationType];
    } else {
      return res.status(404).json({ error: 'Location not found' });
    }

    await rider.save();

    res.json({ message: `${locationType} location removed successfully` });
  } catch (err) {
    console.error('Location delete error:', err);
    res.status(500).json({ error: 'Server error while deleting location' });
  }
});

// 📌 Notifications Routes
// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const rider = await Rider.findById(req.user.id)
      .select('notifications')
      .sort({ 'notifications.timestamp': -1 });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    res.json(rider.notifications || []);
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const rider = await Rider.findOneAndUpdate(
      { 
        _id: req.user.id,
        'notifications._id': req.params.notificationId 
      },
      { 
        $set: { 'notifications.$.read': true } 
      },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Notification update error:', err);
    res.status(500).json({ error: 'Server error while updating notification' });
  }
});

// 📌 Upload Profile Picture
router.post('/profile/picture', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // This would typically use middleware like multer for file uploads
    // For this example, we'll assume the image URL is passed in the request body
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const rider = await Rider.findByIdAndUpdate(
      req.user.id,
      { profile_picture_url: imageUrl },
      { new: true }
    ).select('-password');

    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    res.json({ 
      message: 'Profile picture updated successfully',
      profile_picture_url: rider.profile_picture_url
    });
  } catch (err) {
    console.error('Profile picture update error:', err);
    res.status(500).json({ error: 'Server error while updating profile picture' });
  }
});

// 📌 Request a password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const rider = await Rider.findOne({ email });
    if (!rider) {
      // For security reasons, always return success even if email doesn't exist
      return res.json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }

    // Generate a password reset token
    const resetToken = jwt.sign(
      { id: rider._id.toString() },
      JWT_SECRET + rider.password, // Adding user's hashed password ensures token invalidation after password change
      { expiresIn: '1h' }
    );

    // Store token and expiry in user document
    rider.reset_password_token = resetToken;
    rider.reset_password_expires = Date.now() + 3600000; // 1 hour
    await rider.save();

    // Send email with reset link (implementation would depend on your email service)
    // This is a placeholder for the actual email sending logic
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log(`Password reset link: ${resetUrl}`);

    // In a real implementation, you would send an email:
    // await sendEmail(email, 'Password Reset', `Click the link to reset your password: ${resetUrl}`);

    res.json({ message: 'If your email exists in our system, you will receive a password reset link' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ error: 'Server error while processing password reset request' });
  }
});

// 📌 Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Find user with valid reset token
    const rider = await Rider.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() }
    });

    if (!rider) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    rider.password = hashedPassword;
    rider.reset_password_token = undefined;
    rider.reset_password_expires = undefined;
    
    await rider.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Server error while resetting password' });
  }
});

module.exports = router;