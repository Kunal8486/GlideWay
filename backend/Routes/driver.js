const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Driver = require('../Models/Driver');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Add file validation
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Driver registration endpoint
router.post('/register', upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'license_front', maxCount: 1 },
    { name: 'license_back', maxCount: 1 }
]), async (req, res) => {
    try {
        // Extract all fields from req.body
        const {
            name,
            email,
            phone_number,
            password,
            gender,
            age,
            license_number,
            license_expiry,
            vehicle_make,
            vehicle_model,
            vehicle_registration
        } = req.body;

        // Basic server-side validation (matching frontend validation)
        if (!name || !email || !phone_number || !password || !gender || !age ||
            !license_number || !license_expiry || !vehicle_make || !vehicle_model || !vehicle_registration) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Email validation
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if email already exists
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Validate age
        if (parseInt(age) < 18 || parseInt(age) > 70) {
            return res.status(400).json({ error: "Driver must be between 18 and 70 years old" });
        }

        // Validate license expiry
        const expiryDate = new Date(license_expiry);
        const today = new Date();
        if (expiryDate < today) {
            return res.status(400).json({ error: "License has expired" });
        }

        // Check if files were uploaded
        if (!req.files.profile_picture || !req.files.license_front || !req.files.license_back) {
            return res.status(400).json({ error: "All required documents must be uploaded" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store uploaded file paths
        const profilePictureUrl = req.files.profile_picture[0].path;
        const licenseFrontUrl = req.files.license_front[0].path;
        const licenseBackUrl = req.files.license_back[0].path;

        // Create new driver document
        const driver = new Driver({
            name,
            email,
            phone_number,
            password: hashedPassword,
            gender,
            age: parseInt(age),
            license_number,
            license_expiry,
            profile_picture_url: profilePictureUrl,
            license_front_url: licenseFrontUrl,
            license_back_url: licenseBackUrl,
            vehicle_details: {
                make: vehicle_make,
                model: vehicle_model,
                registration_number: vehicle_registration
            },
            status: 'pending', // Default status for new drivers
            created_at: new Date()
        });

        await driver.save();
        res.status(201).json({ 
            success: true,
            message: "Driver registered successfully!",
            driver: {
                id: driver._id,
                name: driver.name,
                email: driver.email
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
});



module.exports = router;