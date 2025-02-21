const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Driver = require('../Models/Driver');
const router = express.Router();

// Driver login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find driver by email
        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, driver.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if driver is verified
        if (!driver.is_verified) {
            return res.status(403).json({ 
                error: "Account pending verification",
                status: "pending"
            });
        }

        // Create and sign JWT
        const token = jwt.sign(
            { 
                id: driver._id,
                email: driver.email,
                role: 'driver'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                profile_picture: driver.profile_picture_url
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
});

// Route to verify token and get driver info
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization token required" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get driver data
        const driver = await Driver.findById(decoded.id).select('-password');
        if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
        }

        res.status(200).json({
            success: true,
            driver
        });
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
});

// Route for password reset request
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if email exists
        const driver = await Driver.findOne({ email });
        if (!driver) {
            return res.status(404).json({ error: "Email not found" });
        }

        // Generate reset token (would implement email sending in production)
        const resetToken = jwt.sign(
            { id: driver._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In production, you would send an email with the reset link
        // For now, just return success message
        res.status(200).json({
            success: true,
            message: "Password reset instructions sent to your email"
        });
    } catch (error) {
        console.error("Password Reset Error:", error);
        res.status(500).json({ error: "Failed to process password reset request" });
    }
});

module.exports = router;