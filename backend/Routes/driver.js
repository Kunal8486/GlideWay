const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Driver = require('../Models/Driver');
const router = express.Router();

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
    // Accept image files and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only image and PDF files are allowed'), false);
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
    { name: 'license_back', maxCount: 1 },
    { name: 'vehicle_insurance', maxCount: 1 }
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
            referral_code,
            vehicle_make,
            vehicle_model,
            vehicle_registration,
            vehicle_year,
            vehicle_color,
            license_number,
            license_expiry,
            license_state
        } = req.body;

        // Basic server-side validation (matching frontend validation)
        if (!name || !email || !phone_number || !password || !gender || !age ||
            !vehicle_make || !vehicle_model || !vehicle_registration || !vehicle_year || !vehicle_color ||
            !license_number || !license_expiry || !license_state) {
            return res.status(400).json({ error: "All required fields must be filled" });
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
        const parsedAge = parseInt(age);
        if (parsedAge < 18 || parsedAge > 70) {
            return res.status(400).json({ error: "Driver must be between 18 and 70 years old" });
        }

        // Validate license expiry
        const expiryDate = new Date(license_expiry);
        const today = new Date();
        if (expiryDate < today) {
            return res.status(400).json({ error: "License has expired" });
        }

        // Validate vehicle year
        const parsedVehicleYear = parseInt(vehicle_year);
        const currentYear = new Date().getFullYear();
        if (parsedVehicleYear < 1990 || parsedVehicleYear > currentYear + 1) {
            return res.status(400).json({ error: "Invalid vehicle year" });
        }

        // Check if required files were uploaded
        const requiredFiles = ['profile_picture', 'license_front', 'license_back', 'vehicle_insurance'];
        for (let file of requiredFiles) {
            if (!req.files[file]) {
                return res.status(400).json({ error: `${file.replace('_', ' ')} is required` });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store uploaded file paths
        const profilePictureUrl = req.files.profile_picture[0].path;
        const licenseFrontUrl = req.files.license_front[0].path;
        const licenseBackUrl = req.files.license_back[0].path;
        const vehicleInsuranceUrl = req.files.vehicle_insurance[0].path;

        // Create new driver document
        const driver = new Driver({
            name,
            email,
            phone_number,
            password: hashedPassword,
            gender,
            age: parsedAge,
            license_number,
            license_expiry: expiryDate,
            license_front_url: licenseFrontUrl,
            license_back_url: licenseBackUrl,
            license_state, // Added license state
            vehicle_details: {
                make: vehicle_make,
                model: vehicle_model,
                registration_number: vehicle_registration,
                year: parsedVehicleYear, // Corrected vehicle year storage
                color: vehicle_color // Added vehicle color to details
            },
            profile_picture_url: profilePictureUrl,
            vehicle_insurance_url: vehicleInsuranceUrl,
            status: 'pending', // Default status for new drivers
            
            // Optional fields
            ...(referral_code && { referral_code }),
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